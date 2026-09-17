package git

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"sync"
)

// Parallel log reading: one rev-list to fix the commit set, then N workers
// each running git log over stdin for its shard. Downstream tallying is
// order-independent (sets and min/max only), so shards merge exactly.

// NumWorkers picks parallelism for n commits: one per ~512 commits, capped
// at CPUs, overridable with GITWHO_WORKERS (0 or empty means automatic).
func NumWorkers(n int) int {
	if v := strings.TrimSpace(os.Getenv("GITWHO_WORKERS")); v != "" {
		if w, err := strconv.Atoi(v); err == nil && w > 0 {
			return w
		}
	}
	w := runtime.NumCPU()
	for w > 1 && n/w < 512 {
		w--
	}
	return w
}

// RevList returns the commit hashes git would walk, in reverse-chronological
// order. Filters and pathspecs apply here, exactly as in log.
func RevList(ctx context.Context, revs, pathspecs []string, f Filters) ([]string, error) {
	args := append([]string{"rev-list"}, f.ToArgs()...)
	args = append(args, revs...)
	if len(pathspecs) > 0 {
		args = append(args, "--")
		args = append(args, pathspecs...)
	}
	cmd := exec.CommandContext(ctx, "git", args...)
	out, err := cmd.Output()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			return nil, fmt.Errorf("git rev-list failed: %s", strings.TrimSpace(string(ee.Stderr)))
		}
		return nil, fmt.Errorf("git rev-list failed: %w", err)
	}
	var hashes []string
	for _, line := range strings.Split(string(out), "\n") {
		if h := strings.TrimSpace(line); h != "" {
			hashes = append(hashes, h)
		}
	}
	return hashes, nil
}

func logFormat(useMailmap bool) string {
	if useMailmap {
		return "--pretty=format:%H%x00%h%x00%p%x00%aN%x00%aE%x00%at%x00"
	}
	return "--pretty=format:%H%x00%h%x00%p%x00%an%x00%ae%x00%at%x00"
}

// StreamSharded reads the same commits Stream would, spread over workers.
// The yielded order is unspecified; every consumer in this repo is
// order-independent.
func StreamSharded(
	ctx context.Context,
	revs, pathspecs []string,
	f Filters,
	wantDiffs bool,
	useMailmap bool,
) (<-chan Commit, func() error, error) {
	hashes, err := RevList(ctx, revs, pathspecs, f)
	if err != nil {
		return nil, nil, err
	}
	workers := NumWorkers(len(hashes))

	base := []string{
		"-c", "core.quotePath=false",
		"log", logFormat(useMailmap), "-z",
		"--date=unix", "--no-show-signature", "--no-walk", "--stdin",
	}
	if useMailmap {
		base = append(base, "--mailmap")
	} else {
		base = append(base, "--no-mailmap")
	}
	if wantDiffs {
		base = append(base, "--numstat")
	}
	if len(pathspecs) > 0 {
		base = append(base, "--")
		base = append(base, pathspecs...)
	}

	out := make(chan Commit, 256)
	errCh := make(chan error, workers)
	var wg sync.WaitGroup

	for _, shard := range shard(hashes, workers) {
		wg.Add(1)
		go func(revs []string) {
			defer wg.Done()
			if err := runShard(ctx, base, revs, out); err != nil {
				errCh <- err
			}
		}(shard)
	}
	go func() {
		wg.Wait()
		close(out)
		close(errCh)
	}()

	return out, func() error {
		var first error
		for err := range errCh {
			if first == nil {
				first = err
			}
		}
		return first
	}, nil
}

func shard(hashes []string, workers int) [][]string {
	if len(hashes) == 0 {
		return nil
	}
	size := (len(hashes) + workers - 1) / workers
	var out [][]string
	for i := 0; i < len(hashes); i += size {
		end := i + size
		if end > len(hashes) {
			end = len(hashes)
		}
		out = append(out, hashes[i:end])
	}
	return out
}

func runShard(ctx context.Context, base, revs []string, out chan<- Commit) error {
	cmd := exec.CommandContext(ctx, "git", base...)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("shard stdin: %w", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("shard stdout: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("shard stderr: %w", err)
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("shard start: %w", err)
	}

	for _, rev := range revs {
		if _, err := io.WriteString(stdin, rev+"\n"); err != nil {
			stdin.Close()
			return fmt.Errorf("shard feed: %w", err)
		}
	}
	stdin.Close()

	p := newParser(stdout, out)
	p.closeOnDone = false // shared channel; the fan-in goroutine closes it
	go p.run()

	errText, _ := io.ReadAll(stderr)
	if err := p.wait(); err != nil {
		return fmt.Errorf("shard parse: %w", err)
	}
	if err := cmd.Wait(); err != nil {
		if msg := strings.TrimSpace(string(errText)); msg != "" {
			return fmt.Errorf("shard git: %s", msg)
		}
		return fmt.Errorf("shard git: %w", err)
	}
	return nil
}
