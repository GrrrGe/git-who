// GitWho answers "who wrote this code?!" for whole file trees.
//
// Subcommands: table (rank authors), tree (top contributor per path),
// hist (timeline), serve (local web UI). Run `git-who <cmd> -h` for help.
package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/GrrrGe/git-who/internal/app"
	"github.com/GrrrGe/git-who/internal/git"
	"github.com/GrrrGe/git-who/internal/output"
	"github.com/GrrrGe/git-who/internal/serve"
	"github.com/GrrrGe/git-who/internal/stats"
)

var (
	version = "dev"
	commit  = "unknown"
)

type filters struct {
	since    string
	until    string
	authors  multiFlag
	nauthors multiFlag
}

type multiFlag []string

func (m *multiFlag) String() string     { return strings.Join(*m, ",") }
func (m *multiFlag) Set(v string) error { *m = append(*m, v); return nil }

type filterFlags struct {
	f     *filters
	since *string
	until *string
}

func addFilters(fs *flag.FlagSet) *filterFlags {
	ff := &filterFlags{f: &filters{}}
	ff.since = fs.String("since", "", "Only commits after this date (any git log format)")
	ff.until = fs.String("until", "", "Only commits before this date (any git log format)")
	fs.Var(&ff.f.authors, "author", "Only these authors (repeatable)")
	fs.Var(&ff.f.nauthors, "nauthor", "Skip these authors (repeatable)")
	return ff
}

func (ff *filterFlags) done() *filters {
	ff.f.since = *ff.since
	ff.f.until = *ff.until
	return ff.f
}

func onlyOne(flags ...bool) bool {
	seen := false
	for _, f := range flags {
		if f {
			if seen {
				return false
			}
			seen = true
		}
	}
	return true
}

func splitRevs(args []string) ([]string, []string, error) {
	revs, paths, err := git.SplitArgs(args)
	if err != nil {
		return nil, nil, err
	}
	for _, p := range paths {
		if !strings.Contains(p, ":(") {
			continue
		}
		lower := strings.ToLower(p)
		if strings.Contains(lower, "exclude") {
			continue
		}
		return nil, nil, fmt.Errorf("unsupported pathspec magic in %q (only exclude is supported)", p)
	}
	return revs, paths, nil
}

func tableCmd(args []string) error {
	fs := flag.NewFlagSet("table", flag.ContinueOnError)
	csv := fs.Bool("csv", false, "Spreadsheet output")
	js := fs.Bool("json", false, "JSON output")
	byEmail := fs.Bool("e", false, "Group by email instead of name")
	merges := fs.Bool("merges", false, "Count merge commits")
	byLines := fs.Bool("l", false, "Rank by lines changed")
	byFiles := fs.Bool("f", false, "Rank by files changed")
	byFirst := fs.Bool("c", false, "Rank by first edit")
	byLast := fs.Bool("m", false, "Rank by last edit")
	limit := fs.Int("n", 10, "Row limit (0 = all)")
	ff := addFilters(fs)
	if err := fs.Parse(escapeDashDash(args)); err != nil {
		return err
	}
	f := ff.done()
	if !onlyOne(*byLines, *byFiles, *byFirst, *byLast) {
		return errors.New("sort flags -l/-f/-m/-c are mutually exclusive")
	}
	if *limit < 0 {
		return errors.New("-n must be zero or positive")
	}

	mode := stats.Commits
	switch {
	case *byLines:
		mode = stats.Lines
	case *byFiles:
		mode = stats.Files
	case *byFirst:
		mode = stats.FirstEdit
	case *byLast:
		mode = stats.LastEdit
	}

	revs, paths, err := splitRevs(unescapeDashDash(fs.Args()))
	if err != nil {
		return err
	}
	req := app.Request{
		Revs: revs, Paths: paths, Mode: mode, Limit: *limit,
		ByEmail: *byEmail, Merges: *merges,
		Since: f.since, Until: f.until, Authors: f.authors, NAuthors: f.nauthors,
	}
	if *js {
		data, err := app.TableJSON(req)
		if err != nil {
			return err
		}
		_, err = os.Stdout.Write(data)
		return err
	}
	authors, cut, err := app.Table(req)
	if err != nil {
		return err
	}
	if *csv {
		output.PrintCSV(os.Stdout, authors, mode)
	} else {
		output.PrintTable(os.Stdout, authors, mode, *byEmail, cut)
	}
	return nil
}

func treeCmd(args []string) error {
	fs := flag.NewFlagSet("tree", flag.ContinueOnError)
	js := fs.Bool("json", false, "JSON output")
	byEmail := fs.Bool("e", false, "Group by email instead of name")
	all := fs.Bool("a", false, "Annotate every file, including deleted paths")
	merges := fs.Bool("merges", false, "Count merge commits")
	byLines := fs.Bool("l", false, "Rank by lines changed")
	byFiles := fs.Bool("f", false, "Rank by files changed")
	byFirst := fs.Bool("c", false, "Rank by first edit")
	byLast := fs.Bool("m", false, "Rank by last edit")
	depth := fs.Int("d", 0, "Depth limit (0 = all)")
	ff := addFilters(fs)
	if err := fs.Parse(escapeDashDash(args)); err != nil {
		return err
	}
	f := ff.done()
	if !onlyOne(*byLines, *byFiles, *byFirst, *byLast) {
		return errors.New("ranking flags -l/-f/-m/-c are mutually exclusive")
	}

	mode := stats.Commits
	switch {
	case *byLines:
		mode = stats.Lines
	case *byFiles:
		mode = stats.Files
	case *byFirst:
		mode = stats.FirstEdit
	case *byLast:
		mode = stats.LastEdit
	}

	revs, paths, err := splitRevs(unescapeDashDash(fs.Args()))
	if err != nil {
		return err
	}
	req := app.Request{
		Revs: revs, Paths: paths, Mode: mode,
		ByEmail: *byEmail, Merges: *merges,
		Since: f.since, Until: f.until, Authors: f.authors, NAuthors: f.nauthors,
	}
	if *js {
		data, err := app.TreeJSON(req)
		if err != nil {
			if stats.EmptyTree(err) {
				return nil
			}
			return err
		}
		_, err = os.Stdout.Write(data)
		return err
	}
	node, err := app.Tree(req)
	if err != nil {
		if stats.EmptyTree(err) {
			return nil
		}
		return err
	}
	output.PrintTree(os.Stdout, node, mode, *depth, *all)
	return nil
}

func histCmd(args []string) error {
	fs := flag.NewFlagSet("hist", flag.ContinueOnError)
	js := fs.Bool("json", false, "JSON output")
	byEmail := fs.Bool("e", false, "Group by email instead of name")
	merges := fs.Bool("merges", false, "Count merge commits")
	byLines := fs.Bool("l", false, "Rank by lines changed")
	byFiles := fs.Bool("f", false, "Rank by files changed")
	ff := addFilters(fs)
	if err := fs.Parse(escapeDashDash(args)); err != nil {
		return err
	}
	f := ff.done()
	if !onlyOne(*byLines, *byFiles) {
		return errors.New("ranking flags -l/-f are mutually exclusive")
	}

	mode := stats.Commits
	if *byLines {
		mode = stats.Lines
	} else if *byFiles {
		mode = stats.Files
	}

	revs, paths, err := splitRevs(unescapeDashDash(fs.Args()))
	if err != nil {
		return err
	}
	req := app.Request{
		Revs: revs, Paths: paths, Mode: mode,
		ByEmail: *byEmail, Merges: *merges,
		Since: f.since, Until: f.until, Authors: f.authors, NAuthors: f.nauthors,
	}
	if *js {
		data, err := app.HistJSON(req)
		if err != nil {
			return err
		}
		_, err = os.Stdout.Write(data)
		return err
	}
	buckets, err := app.Hist(req)
	if err != nil {
		return err
	}
	output.PrintHist(os.Stdout, buckets, mode)
	return nil
}

func serveCmd(args []string) error {
	fs := flag.NewFlagSet("serve", flag.ContinueOnError)
	port := fs.Int("port", 8080, "Port to listen on")
	repo := fs.String("repo", "", "Repo to prefill in the UI")
	if err := fs.Parse(args); err != nil {
		return err
	}
	addr := fmt.Sprintf("127.0.0.1:%d", *port)
	fmt.Printf("GitWho: http://%s/\n", addr)
	if *repo != "" {
		fmt.Printf("Repo: http://%s/?repo=%s\n", addr, *repo)
	}
	return serve.Run(addr)
}

// The stdlib flag package swallows a lone "--" separator, but git-style
// revision/path splitting needs it. Hide it while parsing, restore after.
func escapeDashDash(args []string) []string {
	out := make([]string, len(args))
	for i, a := range args {
		if a == "--" {
			out[i] = "\x00--"
		} else {
			out[i] = a
		}
	}
	return out
}

func unescapeDashDash(args []string) []string {
	out := make([]string, len(args))
	for i, a := range args {
		out[i] = strings.TrimPrefix(a, "\x00")
	}
	return out
}

func usage() {
	fmt.Println("Usage: git-who [-v] <table|tree|hist|serve> [options] [revisions] [[--] paths]")
	fmt.Println("Rank code authorship across file trees.")
	fmt.Println()
	fmt.Println("  table   Rank authors (default)")
	fmt.Println("  tree    Top contributor per file-tree node")
	fmt.Println("  hist    Timeline of top contributors")
	fmt.Println("  serve   Local web UI")
	fmt.Println()
	fmt.Println("Run git-who <subcommand> -h for details.")
}

func main() {
	// Top-level -v/--version may precede the subcommand.
	idx := 1
	for idx < len(os.Args) {
		switch os.Args[idx] {
		case "-v", "--version", "-version":
			fmt.Printf("%s %s\n", version, commit)
			return
		case "-h", "--help", "-help":
			usage()
			return
		}
		break
	}
	args := os.Args[idx:]
	name := "table"
	if len(args) > 0 && !strings.HasPrefix(args[0], "-") {
		name, args = args[0], args[1:]
	}

	var err error
	switch name {
	case "table":
		err = tableCmd(args)
	case "tree":
		err = treeCmd(args)
	case "hist":
		err = histCmd(args)
	case "serve":
		err = serveCmd(args)
	default:
		fmt.Fprintf(os.Stderr, "unknown subcommand %q\n", name)
		usage()
		os.Exit(2)
	}
	if err != nil {
		fmt.Fprintf(os.Stderr, "git-who: %s\n", err)
		os.Exit(1)
	}
}
