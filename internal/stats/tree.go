package stats

import (
	"errors"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/GrrrGe/git-who/internal/git"
)

var errEmptyTree = errors.New("no commits; tree is empty")

// EmptyTree reports whether err means there was nothing to show.
func EmptyTree(err error) bool {
	return errors.Is(err, errEmptyTree)
}

func minTime(a, b time.Time) time.Time {
	if a.IsZero() {
		return b
	}
	if b.IsZero() {
		return a
	}
	if a.Before(b) {
		return a
	}
	return b
}

func maxTime(a, b time.Time) time.Time {
	if a.After(b) {
		return a
	}
	return b
}

// Node mirrors one directory level of the repository. Winner is the
// top-ranked author for everything at or below the node.
type Node struct {
	Winner   *Author
	Children map[string]*Node
	InTree   bool
	byAuthor map[string]*accumulator
}

func newNode(inTree bool) *Node {
	return &Node{Children: map[string]*Node{}, InTree: inTree, byAuthor: map[string]*accumulator{}}
}

func splitFirst(p string) (head, rest string) {
	if i := strings.Index(p, "/"); i >= 0 {
		return p[:i], p[i+1:]
	}
	return p, ""
}

func (n *Node) insert(relPath, key string, acc *accumulator, inTree bool) {
	if relPath == "" {
		if cur, found := n.byAuthor[key]; found {
			n.byAuthor[key] = mergeAccumulators(cur, acc)
		} else {
			n.byAuthor[key] = acc
		}
		return
	}
	head, rest := splitFirst(relPath)
	child, found := n.Children[head]
	if !found {
		child = newNode(inTree)
		n.Children[head] = child
	}
	child.InTree = child.InTree || inTree
	child.insert(rest, key, acc, inTree)
}

func mergeAccumulators(a, b *accumulator) *accumulator {
	out := &accumulator{
		name:    firstNonEmpty(a.name, b.name),
		email:   firstNonEmpty(a.email, b.email),
		commits: map[string]bool{},
		files:   map[string]bool{},
		added:   a.added + b.added,
		removed: a.removed + b.removed,
	}
	for k := range a.commits {
		out.commits[k] = true
	}
	for k := range b.commits {
		out.commits[k] = true
	}
	for k := range a.files {
		out.files[k] = true
	}
	for k := range b.files {
		out.files[k] = true
	}
	out.first = minTime(nonZero(a.first, b.first), nonZero(b.first, a.first))
	out.last = maxTime(a.last, b.last)
	return out
}

func firstNonEmpty(a, b string) string {
	if a != "" {
		return a
	}
	return b
}

func nonZero(t, fallback time.Time) time.Time {
	if t.IsZero() {
		return fallback
	}
	return t
}

// BuildTree tallies every commit per path, hangs the results on a file tree
// relative to the current directory, and ranks each node.
func BuildTree(
	commits <-chan git.Commit,
	key func(git.Commit) string,
	countMerges bool,
	ignore map[string]bool,
	worktree map[string]bool,
	root string,
	mode Mode,
) (*Node, error) {
	top := newNode(true)

	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	// Tally per author per path first.
	byKey := map[string]map[string]*accumulator{}
	for c := range commits {
		if ignore[c.Hash] {
			continue
		}
		if c.Merge && !countMerges {
			continue
		}
		if len(c.Files) == 0 {
			continue
		}
		k := key(c)
		paths, found := byKey[k]
		if !found {
			paths = map[string]*accumulator{}
			byKey[k] = paths
		}
		for _, f := range c.Files {
			acc, found := paths[f.Path]
			if !found {
				acc = &accumulator{
					name:    c.Author,
					email:   c.Email,
					commits: map[string]bool{},
					files:   map[string]bool{f.Path: true},
					first:   c.Date,
				}
				paths[f.Path] = acc
			}
			solo := &accumulator{
				name:    c.Author,
				email:   c.Email,
				commits: map[string]bool{c.Hash: true},
				files:   map[string]bool{},
				first:   c.Date,
				last:    c.Date,
			}
			if !c.Merge {
				solo.files[f.Path] = true
				solo.added = f.Added
				solo.removed = f.Removed
			}
			paths[f.Path] = mergeAccumulators(acc, solo)
		}
	}

	// Hang tallies on the tree, rebased to the working directory.
	for k, paths := range byKey {
		for p, acc := range paths {
			rel := rebase(root, wd, p)
			if rel == "" {
				continue
			}
			top.insert(rel, k, acc, worktree[rel])
		}
	}

	if len(top.Children) == 0 {
		return nil, errEmptyTree
	}
	top.rank(mode)
	return top, nil
}

// rebase converts a repo-rooted slash path to one relative to dir.
// Paths escaping the working directory are dropped (empty return).
// Symlinks are resolved first so symlinked checkouts (macOS /tmp, linked
// workdirs) still match.
func rebase(root, dir, p string) string {
	if root == "" {
		return p
	}
	if eval, err := filepath.EvalSymlinks(dir); err == nil {
		dir = eval
	}
	if eval, err := filepath.EvalSymlinks(root); err == nil {
		root = eval
	}
	abs := path.Join(root, p)
	rel, err := filepath.Rel(dir, filepath.FromSlash(abs))
	if err != nil || !filepath.IsLocal(rel) {
		return ""
	}
	return filepath.ToSlash(rel)
}

// rank rolls children's tallies up and picks each node's winner.
func (n *Node) rank(m Mode) {
	for _, child := range n.Children {
		child.rank(m)
		for k, acc := range child.byAuthor {
			if cur, found := n.byAuthor[k]; found {
				n.byAuthor[k] = mergeAccumulators(cur, acc)
			} else {
				n.byAuthor[k] = acc
			}
		}
	}
	best, bestVal := "", int64(-1<<63)
	for k, acc := range n.byAuthor {
		if v := acc.finish().Value(m); v > bestVal {
			best, bestVal = k, v
		}
	}
	if best != "" {
		n.Winner = n.byAuthor[best].finish()
	}
}

// SortedChildren lists child names, directories first then alphabetical.
func (n *Node) SortedChildren() []string {
	names := make([]string, 0, len(n.Children))
	for name := range n.Children {
		names = append(names, name)
	}
	sort.Slice(names, func(i, j int) bool {
		di := len(n.Children[names[i]].Children) > 0
		dj := len(n.Children[names[j]].Children) > 0
		if di != dj {
			return di
		}
		return names[i] < names[j]
	})
	return names
}
