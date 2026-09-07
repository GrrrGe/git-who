//go:build ignore

// Generates screenshots/*.svg from real CLI output on a fictional demo repo.
// Run: go run screenshots/gen.go   (builds ./git-who first via make)
package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type seedCommit struct {
	who   string
	email string
	date  string
	files map[string]string // path -> full content
}

func seed() []seedCommit {
	return []seedCommit{
		{"Alice", "alice@example.com", "2025-11-05T10:00:00",
			map[string]string{
				"README.md":   "# demo\n",
				"main.go":     "package main\n\nfunc main() {}\n",
				"pkg/parse.go": "package pkg\n\nfunc Parse(s string) string {\n\treturn s\n}\n",
			}},
		{"Bob", "bob@example.com", "2025-12-10T10:00:00",
			map[string]string{
				"pkg/emit.go": "package pkg\n\nfunc Emit(s string) string {\n\treturn s\n}\n",
			}},
		{"Carol", "carol@example.com", "2026-01-15T10:00:00",
			map[string]string{
				"main.go": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"demo\")\n\tfmt.Println(\"v2\")\n\tfmt.Println(\"v3\")\n\tfmt.Println(\"v4\")\n\tfmt.Println(\"v5\")\n}\n",
				"pkg/parse_test.go": "package pkg\n\nimport \"testing\"\n\nfunc TestParse(t *testing.T) {}\n",
			}},
		{"Alice", "alice@example.com", "2026-02-20T10:00:00",
			map[string]string{
				"docs/guide.md": "# guide\n",
				"pkg/parse.go":  "package pkg\n\nfunc Parse(s string) string {\n\treturn s + s\n}\n\nfunc ParseAll(in []string) []string {\n\tout := make([]string, len(in))\n\tfor i, s := range in {\n\t\tout[i] = Parse(s)\n\t}\n\treturn out\n}\n",
			}},
		{"Bob", "bob@example.com", "2026-03-25T10:00:00",
			map[string]string{
				"docs/api.md": "# api\n",
				"main.go": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"demo\")\n\tfmt.Println(\"v2\")\n\tfmt.Println(\"v3\")\n\tfmt.Println(\"v4\")\n\tfmt.Println(\"v5\")\n\tfmt.Println(\"v6\")\n}\n",
			}},
		{"Carol", "carol@example.com", "2026-04-30T10:00:00",
			map[string]string{
				"pkg/emit.go": "package pkg\n\nimport \"strings\"\n\nfunc Emit(s string) string {\n\treturn strings.ToUpper(s)\n}\n\nfunc EmitAll(in []string) []string {\n\tout := make([]string, len(in))\n\tfor i, s := range in {\n\t\tout[i] = Emit(s)\n\t}\n\treturn out\n}\n",
			}},
		{"Alice", "alice@example.com", "2026-06-12T10:00:00",
			map[string]string{
				"docs/guide.md": "# guide\n\n## install\n\n## usage\n\n## faq\n",
			}},
		{"Bob", "bob@example.com", "2026-08-03T10:00:00",
			map[string]string{
				"pkg/emit.go": "package pkg\n\nimport \"strings\"\n\nfunc Emit(s string) string {\n\treturn strings.TrimSpace(strings.ToUpper(s))\n}\n\nfunc EmitAll(in []string) []string {\n\tout := make([]string, len(in))\n\tfor i, s := range in {\n\t\tout[i] = Emit(s)\n\t}\n\treturn out\n}\n",
			}},
	}
}

func run(dir, name string, env []string, args ...string) {
	cmd := exec.Command(name, args...)
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), env...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("FAILED %s %v in %s: %v\n%s", name, args, dir, err, out)
		os.Exit(1)
	}
}

func buildDemo(root string) string {
	dir, err := os.MkdirTemp(root, "gitwho-demo-")
	if err != nil {
		panic(err)
	}
	run(dir, "git", nil, "init", "-q")
	run(dir, "git", nil, "config", "user.name", "demo")
	run(dir, "git", nil, "config", "user.email", "demo@example.com")
	for i, c := range seed() {
		for p, content := range c.files {
			full := filepath.Join(dir, p)
			if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
				panic(err)
			}
			if err := os.WriteFile(full, []byte(content), 0o644); err != nil {
				panic(err)
			}
		}
		env := []string{
			"GIT_AUTHOR_NAME=" + c.who, "GIT_AUTHOR_EMAIL=" + c.email,
			"GIT_COMMITTER_NAME=" + c.who, "GIT_COMMITTER_EMAIL=" + c.email,
			"GIT_AUTHOR_DATE=" + c.date, "GIT_COMMITTER_DATE=" + c.date,
		}
		run(dir, "git", env, "add", "-A")
		run(dir, "git", env, "commit", "-qm", fmt.Sprintf("commit %d by %s", i+1, c.who))
	}
	return dir
}

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
	charW, lineH, pad, header := 7.9, 19.0, 18.0, 34.0
	w := float64(cols)*charW + pad*2
	h := float64(len(lines))*lineH + pad*2 + header

	var b strings.Builder
	fmt.Fprintf(&b, `<svg xmlns="http://www.w3.org/2000/svg" width="%.0f" height="%.0f" viewBox="0 0 %.0f %.0f" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="%.0f">`, w, h, w, h, fs)
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
	return "$ git-who " + strings.Join(args, " ") + "\n" + string(out)
}

func main() {
	root, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	// Allow running from repo root or screenshots/.
	if _, err := os.Stat(filepath.Join(root, "screenshots", "gen.go")); err == nil {
		// repo root already
	} else if _, err := os.Stat("gen.go"); err == nil {
		root = filepath.Dir(root)
	}
	bin := filepath.Join(root, "git-who")
	if _, err := os.Stat(bin); err != nil {
		fmt.Println("build ./git-who first (make build)")
		os.Exit(1)
	}

	tmpBase, err := os.MkdirTemp("", "gitwho-shots-")
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(tmpBase)

	demo := buildDemo(tmpBase)
	shots := filepath.Join(root, "screenshots")
	jobs := []struct {
		file  string
		title string
		args  []string
	}{
		{"table.svg", "git-who table", []string{"table"}},
		{"table-lines.svg", "git-who table -l", []string{"table", "-l"}},
		{"tree.svg", "git-who tree", []string{"tree"}},
		{"hist.svg", "git-who hist", []string{"hist"}},
	}
	for _, j := range jobs {
		body := capture(bin, demo, j.args...)
		if err := os.WriteFile(filepath.Join(shots, j.file), []byte(svg(j.title, body)), 0o644); err != nil {
			panic(err)
		}
		fmt.Println("wrote", j.file)
	}
}
