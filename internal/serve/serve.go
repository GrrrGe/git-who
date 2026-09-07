// Package serve runs the local web UI: a static frontend plus JSON APIs
// backed by the same analysis as the CLI.
package serve

import (
	"context"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/GrrrGe/git-who/internal/app"
	"github.com/GrrrGe/git-who/internal/stats"
)

//go:embed dist
var distFS embed.FS

// The git layer works off the process working directory, so analyses are
// serialized while each one parks the process inside its repo.
var gate sync.Mutex

type params struct {
	repo  string
	req   app.Request
	depth int
}

func readParams(r *http.Request) params {
	q := r.URL.Query()

	revs := q["rev"]
	if len(revs) == 0 {
		revs = []string{"HEAD"}
	}
	limit, _ := strconv.Atoi(q.Get("limit"))
	depth, _ := strconv.Atoi(q.Get("depth"))

	return params{
		repo:  q.Get("repo"),
		depth: depth,
		req: app.Request{
			Revs:     revs,
			Paths:    q["path"],
			Mode:     stats.ParseMode(q.Get("mode")),
			Limit:    limit,
			ByEmail:  q.Get("email") == "1" || q.Get("email") == "true",
			Hidden:   q.Get("hidden") == "1" || q.Get("hidden") == "true",
			Merges:   q.Get("merges") == "1" || q.Get("merges") == "true",
			Since:    q.Get("since"),
			Until:    q.Get("until"),
			Authors:  q["author"],
			NAuthors: q["nauthor"],
		},
	}
}

var (
	schemeRe = regexp.MustCompile(`^(?i)(https?|git|ssh)://`)
	scpRe    = regexp.MustCompile(`^[\w.\-]+@[^:]+:.+`)
	ownerRe  = regexp.MustCompile(`^[\w.\-]+/[\w.\-]+(?:/.*)?$`)
)

// isRemote decides whether input names a remote repo (GitHub link) or a
// local path.
func isRemote(s string) bool {
	s = strings.TrimSpace(s)
	if s == "" {
		return false
	}
	if s == "." || strings.HasPrefix(s, "./") || strings.HasPrefix(s, "../") ||
		strings.HasPrefix(s, "/") || strings.HasPrefix(s, "~") || strings.Contains(s, "..") {
		return false
	}
	if schemeRe.MatchString(s) || scpRe.MatchString(s) {
		return true
	}
	if strings.HasPrefix(s, "github.com/") {
		return true
	}
	if ownerRe.MatchString(s) {
		return true
	}
	return false
}

// normalizeRemote turns shorthands ("owner/repo", "github.com/o/r") into
// cloneable https URLs; full URLs pass through untouched.
func normalizeRemote(s string) string {
	s = strings.TrimSpace(strings.TrimSuffix(s, "/"))
	if schemeRe.MatchString(s) || scpRe.MatchString(s) {
		return s
	}
	s = strings.TrimPrefix(s, "github.com/")
	if ownerRe.MatchString(s) {
		parts := strings.SplitN(s, "/", 3)
		url := "https://github.com/" + parts[0] + "/" + strings.TrimSuffix(parts[1], ".git")
		if len(parts) == 3 {
			url += "/" + parts[2]
		}
		return url
	}
	return s
}

func cacheBase() (string, error) {
	if base := os.Getenv("XDG_CACHE_HOME"); base != "" {
		return filepath.Join(base, "git-who", "remote"), nil
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".cache", "git-who", "remote"), nil
}

func remoteDir(url string) (string, error) {
	base, err := cacheBase()
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256([]byte(url))
	slug := strings.ToLower(schemeRe.ReplaceAllString(url, ""))
	slug = strings.ReplaceAll(slug, "github.com/", "")
	slug = strings.ReplaceAll(slug, ".git", "")
	var b strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else {
			b.WriteRune('-')
		}
	}
	name := strings.Trim(strings.TrimSpace(b.String()), "-")
	if len(name) > 60 {
		name = name[:60]
	}
	return filepath.Join(base, name+"-"+hex.EncodeToString(sum[:])[:12]), nil
}

// ensureRemote clones a URL into the cache (fetching if already present)
// and returns the local path.
func ensureRemote(url string) (string, error) {
	url = normalizeRemote(url)
	dir, err := remoteDir(url)
	if err != nil {
		return "", err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	if _, err := os.Stat(filepath.Join(dir, ".git")); err == nil {
		if out, err := exec.CommandContext(ctx, "git", "-C", dir, "fetch", "--all", "--prune", "--tags").CombinedOutput(); err != nil {
			slog.Warn("remote refresh failed; using cached clone", "out", strings.TrimSpace(string(out)))
		}
		return dir, nil
	}
	if err := os.MkdirAll(filepath.Dir(dir), 0o755); err != nil {
		return "", err
	}
	if out, err := exec.CommandContext(ctx, "git", "clone", url, dir).CombinedOutput(); err != nil {
		return "", fmt.Errorf("could not clone %q: %s", url, strings.TrimSpace(string(out)))
	}
	return dir, nil
}

// resolveRepo maps API input (local path or remote link) to a local dir.
func resolveRepo(in string) (local string, remote bool, err error) {
	in = strings.TrimSpace(in)
	if in == "" {
		return "", false, fmt.Errorf("pass ?repo=/path/to/repo or a GitHub link")
	}
	if isRemote(in) {
		dir, err := ensureRemote(in)
		if err != nil {
			return "", true, err
		}
		return dir, true, nil
	}
	return in, false, nil
}

func checkRepo(dir string) (string, error) {
	if strings.TrimSpace(dir) == "" {
		return "", fmt.Errorf("pass ?repo=/path/to/repo or a GitHub link")
	}
	abs, err := filepath.Abs(dir)
	if err != nil {
		return "", err
	}
	info, err := os.Stat(abs)
	if err != nil || !info.IsDir() {
		return "", fmt.Errorf("no such directory: %q", dir)
	}
	if out, err := exec.Command("git", "-C", abs, "rev-parse", "--show-toplevel").CombinedOutput(); err != nil {
		return "", fmt.Errorf("not a git repository: %q (%s)", abs, strings.TrimSpace(string(out)))
	}
	return abs, nil
}

// inRepo validates, resolves, parks the process in the repo, and runs fn.
func inRepo(repo string, fn func() (any, error)) (any, error) {
	local, _, err := resolveRepo(repo)
	if err != nil {
		return nil, err
	}
	abs, err := checkRepo(local)
	if err != nil {
		return nil, err
	}

	gate.Lock()
	defer gate.Unlock()
	prev, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	if err := os.Chdir(abs); err != nil {
		return nil, err
	}
	defer func() { _ = os.Chdir(prev) }()
	return fn()
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	_ = enc.Encode(v)
}

func writeBytes(w http.ResponseWriter, data []byte) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(data)
}

func fail(w http.ResponseWriter, err error) {
	slog.Warn("api error", "err", err)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func handleTable(w http.ResponseWriter, r *http.Request) {
	p := readParams(r)
	out, err := inRepo(p.repo, func() (any, error) {
		return app.TableJSON(p.req)
	})
	if err != nil {
		fail(w, err)
		return
	}
	writeBytes(w, out.([]byte))
}

func handleTree(w http.ResponseWriter, r *http.Request) {
	p := readParams(r)
	out, err := inRepo(p.repo, func() (any, error) {
		data, err := app.TreeJSON(p.req)
		if err != nil {
			if stats.EmptyTree(err) {
				return []byte(`{"mode":"` + p.req.Mode.String() + `","root":null}` + "\n"), nil
			}
			return nil, err
		}
		return data, nil
	})
	if err != nil {
		fail(w, err)
		return
	}
	writeBytes(w, out.([]byte))
}

func handleHist(w http.ResponseWriter, r *http.Request) {
	p := readParams(r)
	out, err := inRepo(p.repo, func() (any, error) {
		return app.HistJSON(p.req)
	})
	if err != nil {
		fail(w, err)
		return
	}
	writeBytes(w, out.([]byte))
}

func handleResolve(w http.ResponseWriter, r *http.Request) {
	in := strings.TrimSpace(r.URL.Query().Get("repo"))
	local, remote, err := resolveRepo(in)
	if err != nil {
		fail(w, err)
		return
	}
	abs, err := checkRepo(local)
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, map[string]any{
		"repo":   abs,
		"remote": remote,
		"name":   filepath.Base(strings.TrimSuffix(abs, "/")),
	})
}

// Run serves the UI and APIs on addr (e.g. "127.0.0.1:8080").
func Run(addr string) error {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/table", handleTable)
	mux.HandleFunc("/api/tree", handleTree)
	mux.HandleFunc("/api/hist", handleHist)
	mux.HandleFunc("/api/resolve", handleResolve)

	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			fmt.Fprintln(w, "Web UI not built yet: run `npm run build` in web/ and rebuild.")
		})
	} else {
		mux.Handle("/", http.FileServer(http.FS(sub)))
	}

	slog.Info("serving", "addr", addr)
	return http.ListenAndServe(addr, mux)
}
