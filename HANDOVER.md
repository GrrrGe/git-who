# GitWho: Agent Handover

Project: **GitWho** (`github.com/GrrrGe/git-who`). Authorship analysis for git
repos: `git blame` for file trees. Single Go binary: CLI
(`table`/`tree`/`hist`/`serve`) plus an embedded Vite SPA. Backend is
**stdlib-only Go** (no `go.sum`). One human owner (`gsabu2`); keep history
single-author.

## Layout

```
main.go                  CLI wiring only (flags, dispatch). No analysis here.
internal/git/            git subprocesses + streaming NUL-delimited log parser
internal/stats/          tally engine: authors, tree rollup, timeline buckets
internal/app/            shared orchestration + cached JSON entry points
internal/output/         text renderers + JSON shape builders
internal/serve/          HTTP APIs + go:embed web UI (dist/ IS committed)
internal/cache/          disk JSON result cache (XDG_CACHE_HOME/git-who/results)
web/src/                 SPA: api, state, anim, components/, views/
web/shot.mjs             Web screenshots via installed Chrome (dev only)
web/terminal-shots.mjs   Converts terminal SVG captures to README PNGs
screenshots/gen.go        Terminal SVGs from real CLI output (`go run`, //go:build ignore)
Makefile                 build / install / test / vet
Dockerfile               minimal multi-stage image
```

## Commands

```bash
export PATH="/opt/homebrew/bin:$PATH"   # Go lives here on this machine
make build && ./git-who --version
go test ./...
cd web && npm install && npm run build   # emits internal/serve/dist/
./git-who serve --port 8080              # UI + APIs on 127.0.0.1 only
node web/shot.mjs /path/to/repo          # needs serve on :18083
go run screenshots/gen.go /path/to/repo  # needs ./git-who built
node web/terminal-shots.mjs              # SVGs to README PNGs
```

Tests: 17 funcs (`internal/{git,stats,serve}`). No frameworks. Ruby/rake are
gone; do not reintroduce.

## Data flow

`serve`/`main` → `app.Table|Tree|Hist(JSON)` → `git.Stream` (channel of
`Commit`, parsed by goroutine) → `stats` accumulators (commit/file **sets**,
never counters) → `output` text or JSON. Serve calls the `*JSON` variants,
which check `internal/cache` first.

## API (`internal/serve/serve.go`)

`GET /api/table|tree|hist|resolve`. Params: `repo` (local path or GitHub
link), `rev` (repeatable, default `HEAD`), `path` (repeatable), `mode`
(`commits|lines|files|last_modified|first_modified`), `author`/`nauthor`
(repeatable), `since`, `until`, `limit`, `depth`, `email|hidden|merges=1`.

- JSON shapes: see README "JSON shapes". Buckets serve **newest-first**.
- Remote links clone once to `~/.cache/git-who/remote/<slug>-<sha12>/`,
  then `git fetch` per visit. Local paths analyze in place.
- Cache key (`app/json.go`, currently **v2**): view + repo root +
  `rev-parse`-resolved SHAs + all flags + `.mailmap` /
  `.git-blame-ignore-revs` contents. Bump the version string if output shapes
  or semantics change, or stale entries will serve.
- Concurrency: analyses serialize behind a mutex that `chdir`s into the
  repo (git works off process cwd). Correct for localhost; not multi-tenant.

## Conventions (follow these)

- Copy: **no em-dashes anywhere**, minimal text, no filler. No localhost
  URLs in README or UI strings.
- Never reference upstream (`sinclairtarget`) in code, docs, or screenshots.
  Only exception: none remain. `LICENSE` carries `Copyright (c) 2026 GrrrGe`
  and must keep a copyright line.
- `internal/serve/dist/` is committed (embed requires it at build time).
  Rebuild web before Go after any UI change.
- Terminal SVGs encode spaces as `&#160;` to preserve column alignment.
  README uses PNGs rendered at 2x with explicit display widths.
- Screenshots must come from **real repos** (VLC cache used last), never
  fictional data. Terminal SVGs via `gen.go`; web PNGs via `shot.mjs`.
- `web/node_modules/` ignored. `git-who` binary ignored. Keep history to
  owner-only commits.

## Gotchas learned the hard way

1. **Renames split NULs**: with `-z`, git emits renames as three tokens
   (`added\tremoved\t`, old, new). Parser consumes the pair, keeps dest.
2. **Symlinked cwd empties the tree**: macOS `/tmp` → `/private/var`.
   `rebase()` resolves symlinks on both sides first.
3. **Hist trailing gap**: old "extend to now" loop appended one bucket and
   broke. Now a single dense walk first→end. Test `TestTimelineExtendsToEnd`.
4. **Force-push does NOT clear GitHub contributor stats.** If attribution
   ever needs resetting again: delete the repo via web UI (token lacks
   `delete_repo` scope), `gh repo create`, push. Do not force-push and hope.
5. **Cold VLC costs ~60s** (850 MB history). Capture scripts need long
   timeouts (`shot.mjs` tree wait is 240s). First run warms disk + result
   cache; repeats are sub-second.
6. **Table search re-renders tbody only**: full re-render kills input focus
   mid keystroke. Suggestions are a custom dropdown (native `datalist`
   positions itself unpredictably), prefix matches ranked first.
7. **Reduced motion** respected in CSS. Keep it that way.
8. No external animation libraries or typewriter. The wordmark renders
   fully styled immediately. Loading appears only after 180 ms.
9. Empty hist buckets render muted "no commits", no author dot.
10. `go install ...@latest` prints `unknown unknown` version (no ldflags):
    normal, not a bug.

## Current state

- `master` on `GrrrGe/git-who`, owner-only history. Current UI: aligned file tree columns, native folder toggles, retained
  expansion state, and compact controls. Folders start collapsed.
- Local server typically on `:8080` (`/tmp/gitwho-serve.log`); shot server
  on `:18083`. Both bind localhost only.
- Result cache and remote clones live under `~/.cache/git-who/`.

## Open ideas (not started)

Lazy-load tree children on expand (VLC nested DOM is heavy); parallel log
sharding over rev ranges; cache plain-text CLI output too; optional
shallow-clone preview flag for giant GitHub links.

After rebuilding, replace the installed executable and restart any running
server. An existing process continues serving its old embedded UI.
