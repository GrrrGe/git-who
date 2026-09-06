// Package output renders computed analysis as text tables for the terminal
// or as JSON for scripts and the web UI.
package output

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/GrrrGe/git-who/internal/stats"
)

// ---------- shared formatting ----------

func commas(n int) string {
	if n < 0 {
		return "-" + commas(-n)
	}
	if n < 1000 {
		return fmt.Sprintf("%d", n)
	}
	return commas(n/1000) + fmt.Sprintf(",%03d", n%1000)
}

func ago(now, t time.Time) string {
	if t.IsZero() {
		return "—"
	}
	d := now.Sub(t)
	const (
		minute = time.Minute
		hour   = time.Hour
		day    = 24 * time.Hour
		week   = 7 * day
		month  = 30 * day
		year   = 365 * day
	)
	switch {
	case d < hour:
		m := int(d / minute)
		return fmt.Sprintf("%d min ago", m)
	case d < day:
		h := int(d / hour)
		if h == 1 {
			return "1 hour ago"
		}
		return fmt.Sprintf("%d hrs ago", h)
	case d < week:
		days := int(d / day)
		if days == 1 {
			return "1 day ago"
		}
		return fmt.Sprintf("%d days ago", days)
	case d < month:
		w := int(d / week)
		if w == 1 {
			return "1 week ago"
		}
		return fmt.Sprintf("%d weeks ago", w)
	case d < year:
		m := int(d / month)
		if m == 1 {
			return "1 month ago"
		}
		return fmt.Sprintf("%d mos ago", m)
	default:
		y := int(d / year)
		if y > 99 {
			return ">99 yrs ago"
		}
		if y == 1 {
			return "1 year ago"
		}
		return fmt.Sprintf("%d yrs ago", y)
	}
}

func padRight(s string, w int) string {
	rs := []rune(s)
	if len(rs) >= w {
		return string(rs[:w])
	}
	return s + strings.Repeat(" ", w-len(rs))
}

// ---------- table ----------

// PrintTable writes the author ranking. Wide modes (-l/-f) show files and
// lines; narrow modes show who edited most recently or earliest.
func PrintTable(out io.Writer, authors []*stats.Author, m stats.Mode, byEmail bool, cut int) {
	now := time.Now()
	wide := m == stats.Lines || m == stats.Files

	nameWidth := 30
	for _, a := range authors {
		if n := len([]rune(displayName(a, byEmail))) + 2; n > nameWidth && n <= 44 {
			nameWidth = n
		}
	}

	rule := strings.Repeat("─", nameWidth+34)
	if wide {
		rule = strings.Repeat("─", nameWidth+58)
	}
	fmt.Fprintf(out, "┌%s┐\n", rule)

	when := "Last edit"
	useFirst := m == stats.FirstEdit
	if useFirst {
		when = "First edit"
	}
	if wide {
		fmt.Fprintf(out, "│%-*s %-11s %7s %7s  %17s│\n", nameWidth, "Author", when, "Commits", "Files", "Lines (+/-)")
	} else {
		fmt.Fprintf(out, "│%-*s %-11s %7s│\n", nameWidth, "Author", when, "Commits")
	}
	fmt.Fprintf(out, "├%s┤\n", rule)

	for _, a := range authors {
		t := a.Last
		if useFirst {
			t = a.First
		}
		if wide {
			lines := fmt.Sprintf("+%-6s / -%-6s", commas(a.Added), commas(a.Removed))
			fmt.Fprintf(out, "│%-*s %-11s %7s %7s  %17s│\n",
				nameWidth, displayName(a, byEmail), ago(now, t),
				commas(a.Commits), commas(a.Files), lines)
		} else {
			fmt.Fprintf(out, "│%-*s %-11s %7s│\n",
				nameWidth, displayName(a, byEmail), ago(now, t), commas(a.Commits))
		}
	}
	if cut > 0 {
		fmt.Fprintf(out, "│%-*s│\n", len([]rune(rule)), fmt.Sprintf("...%s more...", commas(cut)))
	}
	fmt.Fprintf(out, "└%s┘\n", rule)
}

func displayName(a *stats.Author, byEmail bool) string {
	if byEmail {
		return fmt.Sprintf("%s <%s>", a.Name, a.Email)
	}
	return a.Name
}

// PrintCSV writes the ranking in spreadsheet form.
func PrintCSV(out io.Writer, authors []*stats.Author, m stats.Mode) {
	head := []string{"name", "email", "commits"}
	if m.NeedsDiffs() {
		head = append(head, "lines_added", "lines_removed", "files")
	}
	head = append(head, "last_edit", "first_edit")
	fmt.Fprintln(out, strings.Join(head, ","))
	for _, a := range authors {
		row := []string{a.Name, a.Email, fmt.Sprintf("%d", a.Commits)}
		if m.NeedsDiffs() {
			row = append(row, fmt.Sprintf("%d", a.Added), fmt.Sprintf("%d", a.Removed), fmt.Sprintf("%d", a.Files))
		}
		row = append(row, a.Last.Format(time.RFC3339), a.First.Format(time.RFC3339))
		fmt.Fprintln(out, strings.Join(row, ","))
	}
}

// ---------- tree ----------

// PrintTree writes one directory level per line with the winning author.
// Children repeating their parent's winner are shown bare to cut noise.
func PrintTree(out io.Writer, root *stats.Node, m stats.Mode, maxDepth int, showAll bool) {
	if maxDepth <= 0 {
		maxDepth = 100
	}
	lines := flattenTree(root, ".", 0, "", nil, maxDepth, showAll, m)
	longest := 0
	for _, l := range lines {
		if n := len([]rune(l.left)); n > longest {
			longest = n
		}
	}
	for _, l := range lines {
		if l.right == "" {
			fmt.Fprintln(out, l.left)
			continue
		}
		dots := strings.Repeat(".", longest-len([]rune(l.left))+4)
		if dots == "" {
			dots = "...."
		}
		fmt.Fprintf(out, "%s%s%s\n", l.left, dots, l.right)
	}
}

type treeLine struct {
	left  string
	right string
}

func treeMetric(a *stats.Author, m stats.Mode) string {
	switch m {
	case stats.Lines:
		return fmt.Sprintf("(+%s / -%s)", commas(a.Added), commas(a.Removed))
	case stats.Files:
		return fmt.Sprintf("(%s)", commas(a.Files))
	case stats.LastEdit:
		return fmt.Sprintf("(%s)", ago(time.Now(), a.Last))
	case stats.FirstEdit:
		return fmt.Sprintf("(%s)", ago(time.Now(), a.First))
	default:
		return fmt.Sprintf("(%s)", commas(a.Commits))
	}
}

func flattenTree(
	n *stats.Node, name string, depth int, prefix string,
	parentWinner *stats.Author, maxDepth int, showAll bool, m stats.Mode,
) []treeLine {
	var lines []treeLine
	label := name
	if len(n.Children) > 0 {
		label += "/"
	}
	right := ""
	if n.Winner != nil && (showAll || parentWinner == nil || n.Winner.Name != parentWinner.Name || n.Winner.Email != parentWinner.Email) {
		right = fmt.Sprintf("%s %s", n.Winner.Name, treeMetric(n.Winner, m))
	}
	if depth == 0 {
		lines = append(lines, treeLine{left: label, right: right})
	} else if n.InTree || showAll {
		lines = append(lines, treeLine{left: prefix + label, right: right})
	}
	if depth >= maxDepth {
		return lines
	}
	kids := n.SortedChildren()
	// Branch glyphs hinge on the last visible child.
	lastVisible := -1
	for i, k := range kids {
		if n.Children[k].InTree || showAll {
			lastVisible = i
		}
	}
	for i, k := range kids {
		child := n.Children[k]
		branch, ext := "├── ", "│   "
		if i == lastVisible {
			branch, ext = "└── ", "    "
		}
		var childPrefix string
		if depth == 0 {
			childPrefix = branch
		} else {
			// Strip this node's own branch glyph, keep ancestor guides.
			base := []rune(prefix)
			if len(base) >= 4 {
				base = base[:len(base)-4]
			} else {
				base = nil
			}
			childPrefix = string(base) + ext + branch
		}
		lines = append(lines, flattenTree(child, k, depth+1, childPrefix, n.Winner, maxDepth, showAll, m)...)
	}
	return lines
}

// ---------- hist ----------

// PrintHist draws the timeline bars: "#" for the winner's share, "-"
// for the rest of the period.
func PrintHist(out io.Writer, buckets []*stats.Bucket, m stats.Mode) {
	const width = 36
	peak := width
	for _, b := range buckets {
		if v := b.TotalValue(m); v > peak {
			peak = v
		}
	}
	for _, b := range buckets {
		v, total := b.WinnerValue(m), b.TotalValue(m)
		if total == 0 {
			fmt.Fprintf(out, "%s ┤ \n", b.Label)
			continue
		}
		win := v * width / peak
		all := total * width / peak
		if v > 0 && win == 0 {
			win = 1
		}
		if total > 0 && all == 0 {
			all = 1
		}
		bar := strings.Repeat("#", win) + strings.Repeat("-", all-win)
		bar += strings.Repeat(" ", width-len([]rune(bar)))
		name := ""
		metric := ""
		if b.Winner != nil {
			name = b.Winner.Name
			metric = histMetric(b.Winner, m)
		}
		fmt.Fprintf(out, "%s ┤ %s  %s %s\n", b.Label, bar, name, metric)
	}
}

func histMetric(a *stats.Author, m stats.Mode) string {
	switch m {
	case stats.Lines:
		return fmt.Sprintf("(+%s / -%s)", commas(a.Added), commas(a.Removed))
	case stats.Files:
		return fmt.Sprintf("(%s)", commas(a.Files))
	default:
		return fmt.Sprintf("(%s)", commas(a.Commits))
	}
}

// ---------- JSON ----------

type authorJSON struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type metricsJSON struct {
	Commits      int    `json:"commits"`
	Files        int    `json:"files"`
	LinesAdded   int    `json:"lines_added"`
	LinesRemoved int    `json:"lines_removed"`
	FirstEdit    string `json:"first_edit"`
	LastEdit     string `json:"last_edit"`
}

func metricsOf(a *stats.Author) metricsJSON {
	if a == nil {
		a = &stats.Author{}
	}
	first, last := "", ""
	if !a.First.IsZero() {
		first = a.First.Format(time.RFC3339)
	}
	if !a.Last.IsZero() {
		last = a.Last.Format(time.RFC3339)
	}
	return metricsJSON{
		Commits: a.Commits, Files: a.Files,
		LinesAdded: a.Added, LinesRemoved: a.Removed,
		FirstEdit: first, LastEdit: last,
	}
}

// BuildTableJSON shapes ranked authors for the API and --json.
func BuildTableJSON(authors []*stats.Author, m stats.Mode) any {
	type row struct {
		Name         string `json:"name"`
		Email        string `json:"email"`
		Commits      int    `json:"commits"`
		Files        int    `json:"files"`
		LinesAdded   int    `json:"lines_added"`
		LinesRemoved int    `json:"lines_removed"`
		FirstEdit    string `json:"first_edit"`
		LastEdit     string `json:"last_edit"`
	}
	rows := make([]row, 0, len(authors))
	for _, a := range authors {
		mt := metricsOf(a)
		rows = append(rows, row{
			Name: a.Name, Email: a.Email, Commits: a.Commits,
			Files: mt.Files, LinesAdded: mt.LinesAdded, LinesRemoved: mt.LinesRemoved,
			FirstEdit: mt.FirstEdit, LastEdit: mt.LastEdit,
		})
	}
	return map[string]any{"mode": m.String(), "authors": rows}
}

type treeJSON struct {
	Name       string      `json:"name"`
	Path       string      `json:"path"`
	IsDir      bool        `json:"is_dir"`
	InWorkTree bool        `json:"in_work_tree"`
	Author     authorJSON  `json:"author"`
	Metrics    metricsJSON `json:"metrics"`
	Value      int64       `json:"value"`
	Children   []treeJSON  `json:"children,omitempty"`
}

func buildTreeJSON(n *stats.Node, name, p string, m stats.Mode) treeJSON {
	t := treeJSON{
		Name: name, Path: p,
		IsDir:      len(n.Children) > 0,
		InWorkTree: n.InTree,
		Value:      0,
	}
	if n.Winner != nil {
		t.Author = authorJSON{Name: n.Winner.Name, Email: n.Winner.Email}
		t.Metrics = metricsOf(n.Winner)
		t.Value = n.Winner.Value(m)
	}
	for _, k := range n.SortedChildren() {
		childPath := k
		if p != "." && p != "" {
			childPath = strings.TrimSuffix(p, "/") + "/" + k
		}
		t.Children = append(t.Children, buildTreeJSON(n.Children[k], k, childPath, m))
	}
	return t
}

// BuildTreeJSON shapes a ranked tree for the API and --json.
func BuildTreeJSON(root *stats.Node, m stats.Mode) any {
	return map[string]any{"mode": m.String(), "root": buildTreeJSON(root, ".", ".", m)}
}

// BuildHistJSON shapes timeline buckets for the API and --json.
func BuildHistJSON(buckets []*stats.Bucket, m stats.Mode) any {
	type row struct {
		Period  string      `json:"period"`
		Start   string      `json:"start"`
		Author  authorJSON  `json:"author"`
		Metrics metricsJSON `json:"metrics"`
		Value   int         `json:"value"`
		Total   int         `json:"total"`
	}
	rows := make([]row, 0, len(buckets))
	for _, b := range buckets {
		var name, email string
		if b.Winner != nil {
			name, email = b.Winner.Name, b.Winner.Email
		}
		rows = append(rows, row{
			Period: b.Label, Start: b.Start.Format(time.RFC3339),
			Author:  authorJSON{Name: name, Email: email},
			Metrics: metricsOf(b.Winner),
			Value:   b.WinnerValue(m), Total: b.TotalValue(m),
		})
	}
	return map[string]any{"mode": m.String(), "buckets": rows}
}

// WriteJSON encodes v indented to stdout.
func WriteJSON(v any) error {
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}
