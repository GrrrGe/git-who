package git

import (
	"strings"
	"testing"
	"time"
)

func feed(t *testing.T, raw string) []Commit {
	t.Helper()
	out := make(chan Commit, 16)
	p := newParser(strings.NewReader(raw), out)
	go p.run()
	var commits []Commit
	for c := range out {
		commits = append(commits, c)
	}
	if err := p.wait(); err != nil {
		t.Fatalf("parse failed: %v", err)
	}
	return commits
}

func TestParseTwoCommits(t *testing.T) {
	var b strings.Builder
	b.WriteString("aaa\x00aa\x00\x00Alice\x00a@x.io\x001700000000\x00")
	b.WriteString("\n10\t2\tmain.go\x00")
	b.WriteString("-\t-\tlogo.png\x00")
	b.WriteString("bbb\x00bb\x00aaa\x00Bob\x00b@x.io\x001700008640\x00")

	commits := feed(t, b.String())
	if len(commits) != 2 {
		t.Fatalf("got %d commits, want 2", len(commits))
	}

	first := commits[0]
	if first.Author != "Alice" || first.Email != "a@x.io" {
		t.Fatalf("bad author: %+v", first)
	}
	if !first.Date.Equal(time.Unix(1700000000, 0)) {
		t.Fatalf("bad date: %v", first.Date)
	}
	if len(first.Files) != 2 {
		t.Fatalf("got %d files, want 2", len(first.Files))
	}
	if first.Files[0] != (FileChange{Path: "main.go", Added: 10, Removed: 2}) {
		t.Fatalf("bad diff: %+v", first.Files[0])
	}
	if first.Files[1].Added != 0 || first.Files[1].Removed != 0 {
		t.Fatalf("binary file should count zero lines: %+v", first.Files[1])
	}

	second := commits[1]
	if second.Merge {
		t.Fatal("single-parent commit flagged as merge")
	}
	if len(second.Files) != 0 {
		t.Fatalf("expected no diffs, got %+v", second.Files)
	}
}

func TestParseMergeFlag(t *testing.T) {
	raw := "mmm\x00mm\x00aaa bbb\x00M\x00m@x.io\x001700000000\x00"
	commits := feed(t, raw)
	if len(commits) != 1 || !commits[0].Merge {
		t.Fatalf("two-parent commit should be a merge: %+v", commits)
	}
}

func TestParseRenameAcrossTokens(t *testing.T) {
	var b strings.Builder
	b.WriteString("rrr\x00rr\x00\x00Ann\x00ann@x.io\x001700000000\x00")
	b.WriteString("\n1\t1\t\x00")
	b.WriteString("old.go\x00")
	b.WriteString("new.go\x00")
	b.WriteString("5\t0\tplain.go\x00")
	b.WriteString("s2\x00s2\x00rrr\x00Zed\x00z@x.io\x001700008640\x00")

	commits := feed(t, b.String())
	if len(commits) != 2 {
		t.Fatalf("got %d commits, want 2", len(commits))
	}
	if len(commits[0].Files) != 2 {
		t.Fatalf("got %d files, want 2: %+v", len(commits[0].Files), commits[0].Files)
	}
	if commits[0].Files[0].Path != "new.go" {
		t.Fatalf("rename destination wrong: %+v", commits[0].Files[0])
	}
	if commits[1].Author != "Zed" {
		t.Fatalf("second commit misaligned: %+v", commits[1])
	}
}

func TestNewPathRename(t *testing.T) {
	if got := newPath("old.go => new.go"); got != "new.go" {
		t.Fatalf("rename not resolved: %q", got)
	}
	if got := newPath("plain.go"); got != "plain.go" {
		t.Fatalf("plain path mangled: %q", got)
	}
}

func TestIsHash(t *testing.T) {
	if !isHash(strings.Repeat("a", 40)) {
		t.Fatal("40-hex should be a hash")
	}
	if isHash("HEAD") || isHash(strings.Repeat("a", 39)) || isHash(strings.Repeat("z", 40)) {
		t.Fatal("non-hash accepted")
	}
}

func TestFiltersToArgs(t *testing.T) {
	f := Filters{Since: "2024-01-01", Authors: []string{"ann", "bob"}, NAuthors: []string{"bot"}}
	args := f.ToArgs()
	joined := strings.Join(args, " ")
	for _, want := range []string{"--since 2024-01-01", "--author ann", "--author bob", "--perl-regexp"} {
		if !strings.Contains(joined, want) {
			t.Fatalf("missing %q in %q", want, joined)
		}
	}
}
