package serve

import (
	"testing"

	"github.com/GrrrGe/git-who/internal/stats"
)

func TestModeNames(t *testing.T) {
	if stats.ParseMode("l") != stats.Lines || stats.ParseMode("lines") != stats.Lines {
		t.Fatal("lines not parsed")
	}
	if stats.ParseMode("f") != stats.Files || stats.ParseMode("m") != stats.LastEdit {
		t.Fatal("files/last edit not parsed")
	}
	if stats.ParseMode("c") != stats.FirstEdit || stats.ParseMode("") != stats.Commits {
		t.Fatal("first edit/default not parsed")
	}
}

func TestIsRemote(t *testing.T) {
	for _, in := range []string{
		"https://github.com/GrrrGe/git-who",
		"https://github.com/GrrrGe/git-who.git",
		"git@github.com:GrrrGe/git-who.git",
		"github.com/GrrrGe/git-who",
		"GrrrGe/git-who",
	} {
		if !isRemote(in) {
			t.Fatalf("expected remote: %q", in)
		}
	}
	for _, in := range []string{"/tmp/x", "./here", "../up", "", "."} {
		if isRemote(in) {
			t.Fatalf("expected local: %q", in)
		}
	}
}

func TestNormalizeRemote(t *testing.T) {
	if got := normalizeRemote("GrrrGe/git-who"); got != "https://github.com/GrrrGe/git-who" {
		t.Fatalf("shorthand: %q", got)
	}
	if got := normalizeRemote("github.com/GrrrGe/git-who"); got != "https://github.com/GrrrGe/git-who" {
		t.Fatalf("domain prefix: %q", got)
	}
	full := "https://github.com/GrrrGe/git-who.git"
	if got := normalizeRemote(full); got != full {
		t.Fatalf("full URL changed: %q", got)
	}
}

func TestCheckRepoRejects(t *testing.T) {
	if _, err := checkRepo(""); err == nil {
		t.Fatal("empty repo accepted")
	}
	if _, err := checkRepo("/no/such/dir/xyz"); err == nil {
		t.Fatal("missing dir accepted")
	}
}
