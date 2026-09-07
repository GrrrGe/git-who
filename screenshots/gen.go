//go:build ignore

// Renders screenshots/*.svg from real CLI output against any repo.
// Run: go run screenshots/gen.go /path/to/repo   (build ./git-who first)
package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func xmlEscape(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}

func svg(title, body string) string {
	lines := strings.Split(strings.TrimRight(body, "\n"), "\n")
	cols := 0
	for _, l := range lines {
		if n := len([]rune(l)); n > cols {
			cols = n
		}
	}
	const fs = 13.0
	charW, lineH, pad, header := 7.9, 21.0, 28.0, 38.0
	w := float64(cols)*charW + pad*2
	h := float64(len(lines))*lineH + pad*2 + header

	var b strings.Builder
	fmt.Fprintf(&b, `<svg xmlns="http://www.w3.org/2000/svg" width="%.0f" height="%.0f" viewBox="0 0 %.0f %.0f" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="%.0f" xml:space="preserve" style="white-space:pre">`, w, h, w, h, fs)
	fmt.Fprintf(&b, `<rect width="100%%" height="100%%" rx="10" fill="#090909" stroke="#262626"/>`)
	fmt.Fprintf(&b, `<circle cx="28" cy="22" r="5" fill="#ff5f57"/><circle cx="46" cy="22" r="5" fill="#febc2e"/><circle cx="64" cy="22" r="5" fill="#28c840"/>`)
	fmt.Fprintf(&b, `<text x="84" y="27" fill="#999999">%s</text>`, xmlEscape(title))
	y := pad + header
	for _, l := range lines {
		fmt.Fprintf(&b, `<text x="%.0f" y="%.0f" fill="#e8e8e8">%s</text>`, pad, y, xmlEscape(l))
		y += lineH
	}
	b.WriteString(`</svg>`)
	return b.String()
}

func capture(bin, dir string, args ...string) string {
	cmd := exec.Command(bin, args...)
	cmd.Dir = dir
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("FAILED git-who %v: %v\n%s", args, err, out)
		os.Exit(1)
	}
	return "$ git-who " + strings.Join(args, " ") + "\n\n" + string(out)
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("usage: go run screenshots/gen.go /path/to/repo")
		os.Exit(2)
	}
	repo := os.Args[1]
	root, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	if _, err := os.Stat(filepath.Join(root, "screenshots", "gen.go")); err != nil {
		fmt.Println("run from the repo root")
		os.Exit(2)
	}
	bin := filepath.Join(root, "git-who")
	if _, err := os.Stat(bin); err != nil {
		fmt.Println("build ./git-who first (make build)")
		os.Exit(1)
	}

	shots := filepath.Join(root, "screenshots")
	jobs := []struct {
		file  string
		title string
		args  []string
	}{
		{"table.svg", "git-who table", []string{"table"}},
		{"table-lines.svg", "git-who table -l", []string{"table", "-l"}},
		{"tree.svg", "git-who tree -d 1", []string{"tree", "-d", "1"}},
		{"hist.svg", "git-who hist", []string{"hist"}},
	}
	for _, j := range jobs {
		body := capture(bin, repo, j.args...)
		if err := os.WriteFile(filepath.Join(shots, j.file), []byte(svg(j.title, body)), 0o644); err != nil {
			panic(err)
		}
		fmt.Println("wrote", j.file)
	}
}
