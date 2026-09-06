// Package app runs authorship analysis for both the CLI and the web UI.
//
// One Request in, computed data out; all printing and JSON shaping lives in
// internal/output so the two front ends can never disagree.
package app

import (
	"context"
	"time"

	"github.com/GrrrGe/git-who/internal/git"
	"github.com/GrrrGe/git-who/internal/stats"
)

// Request mirrors the CLI flags and the web API query parameters.
type Request struct {
	Revs     []string
	Paths    []string
	Mode     stats.Mode
	Limit    int
	ByEmail  bool
	Hidden   bool
	Merges   bool
	Since    string
	Until    string
	Authors  []string
	NAuthors []string
}

func (r Request) key() func(git.Commit) string {
	return stats.KeyFunc(r.ByEmail)
}

func (r Request) filters() git.Filters {
	return git.Filters{Since: r.Since, Until: r.Until, Authors: r.Authors, NAuthors: r.NAuthors}
}

func ignoreSet(root string) map[string]bool {
	set := map[string]bool{}
	for _, rev := range git.IgnoreRevs(root) {
		set[rev] = true
	}
	return set
}

// Table returns ranked authors (already truncated to Limit) plus how many
// were cut off.
func Table(r Request) ([]*stats.Author, int, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	root, err := git.Root()
	if err != nil {
		return nil, 0, err
	}

	stream, wait, err := git.Stream(ctx, r.Revs, r.Paths, r.filters(), r.Mode.NeedsDiffs(), git.HasMailmap(root))
	if err != nil {
		return nil, 0, err
	}
	authors := stats.Summarize(stream, r.key(), r.Merges, ignoreSet(root))
	if err := wait(); err != nil {
		return nil, 0, err
	}
	ranked, cut := stats.Rank(authors, r.Mode, r.Limit)
	return ranked, cut, nil
}

// Tree returns the ranked file tree for the request.
func Tree(r Request) (*stats.Node, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	root, err := git.Root()
	if err != nil {
		return nil, err
	}
	worktree, err := git.WorkTreeFiles(r.Paths)
	if err != nil {
		return nil, err
	}

	stream, wait, err := git.Stream(ctx, r.Revs, r.Paths, r.filters(), true, git.HasMailmap(root))
	if err != nil {
		return nil, err
	}
	node, buildErr := stats.BuildTree(stream, r.key(), r.Merges, ignoreSet(root), worktree, root, r.Mode)
	if err := wait(); err != nil {
		return nil, err
	}
	return node, buildErr
}

// Hist returns ranked timeline buckets for the request.
func Hist(r Request) ([]*stats.Bucket, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	root, err := git.Root()
	if err != nil {
		return nil, err
	}

	var end time.Time
	if len(r.Revs) == 1 && r.Revs[0] == "HEAD" && r.Until == "" {
		end = time.Now()
	}

	stream, wait, err := git.Stream(ctx, r.Revs, r.Paths, r.filters(), r.Mode.NeedsDiffs(), git.HasMailmap(root))
	if err != nil {
		return nil, err
	}
	buckets := stats.Timeline(stream, r.key(), r.Merges, ignoreSet(root), end, r.Mode)
	if err := wait(); err != nil {
		return nil, err
	}
	return buckets, nil
}
