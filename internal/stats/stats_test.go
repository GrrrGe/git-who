package stats

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/GrrrGe/git-who/internal/git"
)

func commit(hash, author, email string, day int, files ...git.FileChange) git.Commit {
	short := hash
	if len(short) > 6 {
		short = short[:6]
	}
	return git.Commit{
		Hash: hash, Short: short,
		Author: author, Email: email,
		Date:  time.Date(2024, 1, day, 12, 0, 0, 0, time.UTC),
		Files: files,
	}
}

func feed(commits ...git.Commit) <-chan git.Commit {
	ch := make(chan git.Commit, len(commits))
	for _, c := range commits {
		ch <- c
	}
	close(ch)
	return ch
}

func TestSummarizeCounts(t *testing.T) {
	commits := feed(
		commit("a1", "Ann", "ann@x.io", 2, git.FileChange{Path: "f.go", Added: 10, Removed: 1}),
		commit("a2", "Ann", "ann@x.io", 5, git.FileChange{Path: "f.go", Added: 3, Removed: 3}),
		commit("b1", "Bob", "bob@x.io", 3, git.FileChange{Path: "g.go", Added: 1, Removed: 0}),
	)
	authors := Summarize(commits, KeyFunc(false), false, nil)
	if len(authors) != 2 {
		t.Fatalf("got %d authors, want 2", len(authors))
	}

	ranked, cut := Rank(authors, Commits, 0)
	if cut != 0 {
		t.Fatalf("unexpected cut %d", cut)
	}
	if ranked[0].Name != "Ann" || ranked[0].Commits != 2 {
		t.Fatalf("bad winner: %+v", ranked[0])
	}
	if ranked[0].Added != 13 || ranked[0].Removed != 4 || ranked[0].Files != 1 {
		t.Fatalf("bad volume: %+v", ranked[0])
	}

	byLines, _ := Rank(authors, Lines, 0)
	if byLines[0].Name != "Ann" {
		t.Fatalf("lines winner wrong: %+v", byLines[0])
	}

	limited, cut := Rank(authors, Commits, 1)
	if len(limited) != 1 || cut != 1 {
		t.Fatalf("limit broken: %d rows, cut %d", len(limited), cut)
	}
}

func TestSummarizeSkipsMergesAndIgnored(t *testing.T) {
	m := commit("m1", "Ann", "ann@x.io", 2)
	m.Merge = true
	authors := Summarize(feed(m), KeyFunc(false), false, nil)
	if len(authors) != 0 {
		t.Fatalf("merge should be skipped: %+v", authors)
	}

	authors = Summarize(feed(m), KeyFunc(false), true, nil)
	if len(authors) != 1 || authors[0].Commits != 1 {
		t.Fatalf("counted merge wrong: %+v", authors)
	}

	c := commit("c1", "Bob", "bob@x.io", 3)
	authors = Summarize(feed(c), KeyFunc(false), false, map[string]bool{"c1": true})
	if len(authors) != 0 {
		t.Fatalf("ignored rev should be skipped: %+v", authors)
	}
}

func TestBuildTreeRanksNodes(t *testing.T) {
	commits := feed(
		commit("a1", "Ann", "ann@x.io", 2, git.FileChange{Path: "pkg/f.go", Added: 5, Removed: 0}),
		commit("a2", "Ann", "ann@x.io", 3, git.FileChange{Path: "pkg/g.go", Added: 1, Removed: 0}),
		commit("b1", "Bob", "bob@x.io", 4, git.FileChange{Path: "top.go", Added: 9, Removed: 0}),
	)
	worktree := map[string]bool{"pkg/f.go": true, "pkg/g.go": true, "top.go": true}
	root, err := BuildTree(commits, KeyFunc(false), false, nil, worktree, "", Commits)
	if err != nil {
		t.Fatalf("build failed: %v", err)
	}
	if root.Winner == nil || root.Winner.Name != "Ann" {
		t.Fatalf("root winner should be Ann: %+v", root.Winner)
	}
	pkg := root.Children["pkg"]
	if pkg == nil || pkg.Winner.Name != "Ann" {
		t.Fatalf("pkg winner should be Ann: %+v", pkg)
	}
	if _, found := root.Children["top.go"]; !found {
		t.Fatal("top.go missing from tree")
	}
}

func TestBuildTreeEmpty(t *testing.T) {
	ch := make(chan git.Commit)
	close(ch)
	_, err := BuildTree(ch, KeyFunc(false), false, nil, map[string]bool{}, "", Commits)
	if !EmptyTree(err) {
		t.Fatalf("expected empty-tree error, got %v", err)
	}
}

func TestRebaseThroughSymlink(t *testing.T) {
	real, err := os.MkdirTemp("", "real")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(real)
	link := filepath.Join(os.TempDir(), "gitwho-link-test")
	os.Remove(link)
	if err := os.Symlink(real, link); err != nil {
		t.Skip("symlinks unsupported")
	}
	defer os.Remove(link)

	// The working dir may itself be reached via a symlink (macOS /tmp).
	// Paths must still resolve instead of being dropped.
	if got := rebase(real, link, "pkg/f.go"); got != "pkg/f.go" {
		t.Fatalf("symlinked rebase dropped the path: %q", got)
	}
	if got := rebase(real, link, "../escape.go"); got != "" {
		t.Fatalf("escaping path should be dropped: %q", got)
	}
}

func TestTimelineExtendsToEnd(t *testing.T) {
	c := commit("e1", "Ann", "ann@x.io", 1)
	start := time.Date(2024, 1, 15, 12, 0, 0, 0, time.UTC)
	c.Date = start
	end := time.Date(2024, 4, 1, 12, 0, 0, 0, time.UTC)
	buckets := Timeline(feed(c), KeyFunc(false), false, nil, end, Commits)
	if len(buckets) != 4 {
		t.Fatalf("want Jan..Apr buckets, got %d: %+v", len(buckets), buckets)
	}
	if buckets[3].Label != "Apr 2024" || buckets[3].WinnerValue(Commits) != 0 {
		t.Fatalf("trailing bucket wrong: %+v", buckets[3])
	}
}

func TestTimelineBuckets(t *testing.T) {
	var commits []git.Commit
	for d := 0; d < 70; d++ {
		who := "Ann"
		if d >= 35 {
			who = "Bob"
		}
		c := commit(fmt.Sprintf("hash-%03d", d), who, who+"@x.io", 1)
		c.Date = time.Date(2024, 1, 1, 12, 0, 0, 0, time.UTC).AddDate(0, 0, d)
		commits = append(commits, c)
	}
	buckets := Timeline(feed(commits...), KeyFunc(false), false, nil, time.Time{}, Commits)
	if len(buckets) == 0 {
		t.Fatal("no buckets produced")
	}
	// 70 days must collapse to monthly buckets.
	for _, b := range buckets {
		if len(b.Label) < 8 || b.Label[3] != ' ' {
			t.Fatalf("expected monthly label like %q, got %q", "Feb 2024", b.Label)
		}
	}
	if buckets[0].Winner == nil || buckets[0].Winner.Name != "Ann" {
		t.Fatalf("first bucket winner should be Ann: %+v", buckets[0].Winner)
	}
}
