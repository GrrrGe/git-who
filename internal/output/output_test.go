package output

import (
	"bytes"
	"strings"
	"testing"
	"time"
	"unicode/utf8"

	"github.com/GrrrGe/git-who/internal/stats"
)

func TestTableColumnAlignment(t *testing.T) {
	now := time.Now()
	authors := []*stats.Author{
		{Name: "Rémi Denis-Courmont", Email: "remi@example.org", Commits: 18503, Added: 123456789, Removed: 2345678, Files: 12345, First: now, Last: now},
		{Name: "An author with a name longer than the old column limit", Email: "long@example.org", Commits: 1, First: now, Last: now},
	}
	for _, mode := range []stats.Mode{stats.Commits, stats.Lines, stats.Files, stats.FirstEdit, stats.LastEdit} {
		t.Run(mode.String(), func(t *testing.T) {
			var out bytes.Buffer
			PrintTable(&out, authors, mode, true, 1000)
			lines := strings.Split(strings.TrimSpace(out.String()), "\n")
			width := utf8.RuneCountInString(lines[0])
			for _, line := range lines {
				if got := utf8.RuneCountInString(line); got != width {
					t.Errorf("row width %d, border width %d: %q", got, width, line)
				}
			}
			for _, author := range authors {
				if !strings.Contains(out.String(), displayName(author, true)) {
					t.Errorf("author was truncated: %s", author.Name)
				}
			}
			if !strings.Contains(out.String(), "18,503") || !strings.Contains(out.String(), "...1,000 more...") {
				t.Fatal("missing commit count or remaining-author count")
			}
		})
	}
}

func TestEmptyTable(t *testing.T) {
	var out bytes.Buffer
	PrintTable(&out, nil, stats.Commits, false, 0)
	lines := strings.Split(strings.TrimSpace(out.String()), "\n")
	if len(lines) != 4 || !strings.Contains(lines[1], "Author") {
		t.Fatalf("unexpected empty table: %s", out.String())
	}
}

func TestTreeAncestorGuides(t *testing.T) {
	folder := func() *stats.Node {
		return &stats.Node{InTree: true, Children: map[string]*stats.Node{
			"first": {InTree: true}, "last": {InTree: true},
		}}
	}
	root := &stats.Node{InTree: true, Children: map[string]*stats.Node{
		"a": folder(), "b": folder(),
	}}
	var out bytes.Buffer
	PrintTree(&out, root, stats.Commits, 3, false)
	want := "./\n├── a/\n│   ├── first\n│   └── last\n└── b/\n    ├── first\n    └── last\n"
	if out.String() != want {
		t.Fatalf("incorrect ancestor guides:\n%s\nwant:\n%s", out.String(), want)
	}
}
