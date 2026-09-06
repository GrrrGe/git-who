// Package stats reduces a stream of commits to per-author numbers,
// file-tree winners, and timeline buckets.
package stats

import (
	"sort"
	"time"

	"github.com/GrrrGe/git-who/internal/git"
)

// Mode selects which number authors are ranked by.
type Mode int

const (
	Commits Mode = iota
	Lines
	Files
	FirstEdit
	LastEdit
)

// NeedsDiffs reports whether the mode needs per-file line counts.
func (m Mode) NeedsDiffs() bool {
	return m == Lines || m == Files
}

func (m Mode) String() string {
	switch m {
	case Lines:
		return "lines"
	case Files:
		return "files"
	case FirstEdit:
		return "first_modified"
	case LastEdit:
		return "last_modified"
	default:
		return "commits"
	}
}

// ParseMode maps CLI and API names to a Mode.
func ParseMode(s string) Mode {
	switch s {
	case "lines", "l":
		return Lines
	case "files", "f":
		return Files
	case "last_modified", "m":
		return LastEdit
	case "first_modified", "c":
		return FirstEdit
	default:
		return Commits
	}
}

// KeyFunc identifies an author; by email with -e, by name otherwise.
func KeyFunc(byEmail bool) func(git.Commit) string {
	if byEmail {
		return func(c git.Commit) string { return c.Email }
	}
	return func(c git.Commit) string { return c.Author }
}

// Author tallies everything known about one contributor.
type Author struct {
	Name    string
	Email   string
	Commits int
	Added   int
	Removed int
	Files   int
	First   time.Time
	Last    time.Time
}

// Value returns the ranking number for a mode.
func (a *Author) Value(m Mode) int64 {
	switch m {
	case Lines:
		return int64(a.Added + a.Removed)
	case Files:
		return int64(a.Files)
	case FirstEdit:
		return -a.First.Unix()
	case LastEdit:
		return a.Last.Unix()
	default:
		return int64(a.Commits)
	}
}

type accumulator struct {
	name    string
	email   string
	commits map[string]bool
	files   map[string]bool
	added   int
	removed int
	first   time.Time
	last    time.Time
}

func newAccumulator(c git.Commit) *accumulator {
	return &accumulator{
		name:    c.Author,
		email:   c.Email,
		commits: map[string]bool{},
		files:   map[string]bool{},
		first:   c.Date,
	}
}

func (a *accumulator) add(c git.Commit, countMerges bool) {
	if c.Merge && !countMerges {
		return
	}
	if a.name == "" {
		a.name = c.Author
	}
	if a.email == "" {
		a.email = c.Email
	}
	a.commits[c.Hash] = true
	if a.first.IsZero() || c.Date.Before(a.first) {
		a.first = c.Date
	}
	if c.Date.After(a.last) {
		a.last = c.Date
	}
	if c.Merge {
		return // merge commits never contribute lines or files
	}
	for _, f := range c.Files {
		a.files[f.Path] = true
		a.added += f.Added
		a.removed += f.Removed
	}
}

func (a *accumulator) finish() *Author {
	return &Author{
		Name:    a.name,
		Email:   a.email,
		Commits: len(a.commits),
		Added:   a.added,
		Removed: a.removed,
		Files:   len(a.files),
		First:   a.first,
		Last:    a.last,
	}
}

// Summarize folds commits into one Author per key, skipping ignored and
// (unless requested) merge commits.
func Summarize(
	commits <-chan git.Commit,
	key func(git.Commit) string,
	countMerges bool,
	ignore map[string]bool,
) []*Author {
	byKey := map[string]*accumulator{}
	for c := range commits {
		if ignore[c.Hash] {
			continue
		}
		if c.Merge && !countMerges {
			continue
		}
		k := key(c)
		acc, found := byKey[k]
		if !found {
			acc = newAccumulator(c)
			byKey[k] = acc
		}
		acc.add(c, countMerges)
	}

	out := make([]*Author, 0, len(byKey))
	for _, acc := range byKey {
		out = append(out, acc.finish())
	}
	Sort(out, Commits)
	return out
}

// Sort orders authors best-first for a mode (ties: most recently active,
// then name).
func Sort(authors []*Author, m Mode) {
	sort.Slice(authors, func(i, j int) bool {
		vi, vj := authors[i].Value(m), authors[j].Value(m)
		if vi != vj {
			return vi > vj
		}
		if !authors[i].Last.Equal(authors[j].Last) {
			return authors[i].Last.After(authors[j].Last)
		}
		return authors[i].Name < authors[j].Name
	})
}

// Rank sorts a copy best-first and truncates to limit (0 = no limit),
// reporting how many authors were cut.
func Rank(authors []*Author, m Mode, limit int) ([]*Author, int) {
	ranked := append([]*Author{}, authors...)
	Sort(ranked, m)
	if limit > 0 && limit < len(ranked) {
		return ranked[:limit], len(ranked) - limit
	}
	return ranked, 0
}
