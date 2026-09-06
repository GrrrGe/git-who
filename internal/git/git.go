// Package git shells out to the git binary to read history.
//
// Everything here is streaming: log output is parsed commit-by-commit as it
// arrives, so even large repositories never hold the whole log in memory.
package git

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func fileExists(p string) bool {
	info, err := os.Stat(p)
	return err == nil && !info.IsDir()
}

func readFile(p string) ([]byte, error) {
	return os.ReadFile(p)
}

// FileChange is one path touched by a commit with line counts.
type FileChange struct {
	Path    string
	Added   int
	Removed int
}

// Commit is a single parsed commit plus its diff stats.
type Commit struct {
	Hash   string
	Short  string
	Merge  bool
	Author string
	Email  string
	Date   time.Time
	Files  []FileChange
}

// Filters narrow which commits git returns.
type Filters struct {
	Since    string
	Until    string
	Authors  []string
	NAuthors []string
}

// ToArgs renders filters as git log arguments.
func (f Filters) ToArgs() []string {
	args := []string{}
	if f.Since != "" {
		args = append(args, "--since", f.Since)
	}
	if f.Until != "" {
		args = append(args, "--until", f.Until)
	}
	for _, a := range f.Authors {
		args = append(args, "--author", a)
	}
	if len(f.NAuthors) > 0 {
		// git has no --nauthor, so exclude via a negative lookahead that
		// must match the whole author string.
		args = append(args, "--perl-regexp", "--author",
			fmt.Sprintf(`^((?!%s).*)$`, strings.Join(f.NAuthors, "|")))
	}
	return args
}

// SplitArgs separates revisions from pathspecs the way git does, using
// rev-parse to disambiguate. With no revisions, HEAD is the default.
func SplitArgs(args []string) (revs, paths []string, err error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cmd := exec.CommandContext(ctx, "git", append([]string{"rev-parse", "--no-flags", "--"}, args...)...)
	out, err := cmd.Output()
	if err != nil {
		return nil, nil, fmt.Errorf("could not parse arguments: %w", err)
	}

	pastRevs := false
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || line == "--" {
			// rev-parse echoes the separator; everything after the first
			// non-hash line is a path.
			if line == "--" {
				pastRevs = true
			}
			continue
		}
		if !pastRevs && isHash(line) {
			revs = append(revs, line)
			continue
		}
		pastRevs = true
		paths = append(paths, filepath.ToSlash(line))
	}

	if len(revs) == 0 {
		revs = []string{"HEAD"}
	}
	return revs, paths, nil
}

func isHash(s string) bool {
	if len(s) != 40 {
		return false
	}
	for _, r := range s {
		if (r < '0' || r > '9') && (r < 'a' || r > 'f') {
			return false
		}
	}
	return true
}

// Root returns the repository top level for the current directory.
func Root() (string, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cmd := exec.CommandContext(ctx, "git", "rev-parse", "--show-toplevel")
	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("not a git repository: %w", err)
	}
	return strings.TrimSpace(string(out)), nil
}

// WorkTreeFiles lists files in the working tree (relative, slash-separated).
func WorkTreeFiles(pathspecs []string) (map[string]bool, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	args := append([]string{"ls-files", "--exclude-standard", "-z"}, pathspecs...)
	cmd := exec.CommandContext(ctx, "git", args...)
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("could not list working tree files: %w", err)
	}

	set := map[string]bool{}
	for _, p := range bytes.Split(out, []byte{0}) {
		if len(p) > 0 {
			set[string(p)] = true
		}
	}
	return set, nil
}

// HasMailmap reports whether the repo root holds a .mailmap file.
func HasMailmap(root string) bool {
	return fileExists(filepath.Join(root, ".mailmap"))
}

// IgnoreRevs reads .git-blame-ignore-revs from the repo root, if present.
func IgnoreRevs(root string) []string {
	data, err := readFile(filepath.Join(root, ".git-blame-ignore-revs"))
	if err != nil {
		return nil
	}
	var revs []string
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line != "" && !strings.HasPrefix(line, "#") {
			revs = append(revs, line)
		}
	}
	return revs
}

// Stream opens a git log pipe and yields commits as they are parsed.
// Call wait when the stream is exhausted to release the subprocess.
func Stream(
	ctx context.Context,
	revs, pathspecs []string,
	f Filters,
	wantDiffs bool,
	useMailmap bool,
) (<-chan Commit, func() error, error) {
	format := "--pretty=format:%H%x00%h%x00%p%x00%an%x00%ae%x00%at%x00"
	if useMailmap {
		format = "--pretty=format:%H%x00%h%x00%p%x00%aN%x00%aE%x00%at%x00"
	}

	args := []string{
		"-c", "core.quotePath=false",
		"log", format, "-z",
		"--date=unix", "--reverse", "--no-show-signature",
	}
	if useMailmap {
		args = append(args, "--mailmap")
	} else {
		args = append(args, "--no-mailmap")
	}
	if wantDiffs {
		args = append(args, "--numstat")
	}
	args = append(args, f.ToArgs()...)
	args = append(args, revs...)
	if len(pathspecs) > 0 {
		args = append(args, "--")
		args = append(args, pathspecs...)
	}

	cmd := exec.CommandContext(ctx, "git", args...)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, nil, fmt.Errorf("could not open git output: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, nil, fmt.Errorf("could not open git errors: %w", err)
	}
	if err := cmd.Start(); err != nil {
		return nil, nil, fmt.Errorf("could not start git log: %w", err)
	}

	out := make(chan Commit, 64)
	parser := newParser(stdout, out)
	go parser.run()

	wait := func() error {
		parserErr := parser.wait()
		errText, _ := io.ReadAll(stderr)
		if err := cmd.Wait(); err != nil {
			msg := strings.TrimSpace(string(errText))
			if msg != "" {
				return fmt.Errorf("git log failed: %s", msg)
			}
			return fmt.Errorf("git log failed: %w", err)
		}
		return parserErr
	}
	return out, wait, nil
}

// parser turns git's NUL-delimited log stream into commits.
//
// Layout per commit: six NUL-terminated header fields
// (hash, short, parents, author, email, unix-timestamp), then zero or more
// NUL-terminated numstat lines ("added<TAB>removed<TAB>path"). The first
// stat line carries a stray leading newline which is trimmed. A token
// without a tab ends the stat block and starts the next commit.
type parser struct {
	r    *bufio.Reader
	out  chan<- Commit
	done chan error
}

func newParser(r io.Reader, out chan<- Commit) *parser {
	return &parser{r: bufio.NewReader(r), out: out, done: make(chan error, 1)}
}

func (p *parser) run() {
	p.done <- p.parse()
	close(p.out)
}

func (p *parser) wait() error {
	return <-p.done
}

func (p *parser) next() (string, error) {
	tok, err := p.r.ReadString(0)
	if err != nil {
		return "", err
	}
	return tok[:len(tok)-1], nil
}

func (p *parser) parse() error {
	var lookahead *string
	take := func() (string, error) {
		if lookahead != nil {
			t := *lookahead
			lookahead = nil
			return t, nil
		}
		return p.next()
	}

	for {
		hash, err := take()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return fmt.Errorf("could not read commit: %w", err)
		}
		if hash == "" {
			continue
		}

		fields := make([]string, 0, 6)
		fields = append(fields, hash)
		ok := true
		for len(fields) < 6 {
			t, err := p.next()
			if err != nil {
				if err == io.EOF {
					return fmt.Errorf("truncated commit %q", hash)
				}
				return fmt.Errorf("could not read commit: %w", err)
			}
			fields = append(fields, t)
		}

		parents := []string{}
		if strings.TrimSpace(fields[2]) != "" {
			parents = strings.Fields(fields[2])
		}
		ts, err := strconv.ParseInt(strings.TrimSpace(fields[5]), 10, 64)
		if err != nil {
			return fmt.Errorf("bad timestamp in commit %q: %w", hash, err)
		}

		c := Commit{
			Hash:   fields[0],
			Short:  fields[1],
			Merge:  len(parents) > 1,
			Author: fields[3],
			Email:  fields[4],
			Date:   time.Unix(ts, 0),
		}

		for {
			t, err := p.next()
			if err == io.EOF {
				p.out <- c
				return nil
			}
			if err != nil {
				return fmt.Errorf("could not read diff stats: %w", err)
			}
			t = strings.TrimPrefix(t, "\n")
			if !strings.Contains(t, "\t") {
				// Next commit's hash; hold it for the next round.
				p.out <- c
				lookahead = &t
				ok = false
				break
			}
			parts := strings.SplitN(t, "\t", 3)
			if len(parts) < 2 {
				continue
			}
			added := atoiOr(parts[0], 0) // "-" for binary files -> 0
			removed := atoiOr(parts[1], 0)
			path := ""
			if len(parts) == 3 && parts[2] != "" {
				path = newPath(parts[2])
			} else {
				// Renames arrive as three tokens: "added<TAB>removed<TAB>",
				// old path, new path. Keep the destination.
				oldName, err := p.next()
				if err == io.EOF {
					p.out <- c
					return nil
				}
				if err != nil {
					return fmt.Errorf("could not read diff stats: %w", err)
				}
				newName, err := p.next()
				if err == io.EOF {
					p.out <- c
					return nil
				}
				if err != nil {
					return fmt.Errorf("could not read diff stats: %w", err)
				}
				_ = oldName
				path = strings.TrimPrefix(newName, "\n")
			}
			c.Files = append(c.Files, FileChange{
				Path:    path,
				Added:   added,
				Removed: removed,
			})
		}
		if ok {
			p.out <- c
		}
	}
}

// newPath resolves rename arrows ("old => new") to the new path.
func newPath(p string) string {
	if i := strings.LastIndex(p, " => "); i >= 0 {
		tail := p[i+4:]
		tail = strings.Trim(tail, "{}")
		return tail
	}
	return strings.Trim(p, "{}")
}

func atoiOr(s string, fallback int) int {
	n, err := strconv.Atoi(strings.TrimSpace(s))
	if err != nil {
		return fallback
	}
	return n
}
