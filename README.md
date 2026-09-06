# GitWho

> **Who wrote this code?!** — `git blame` for file trees.

`git blame` tells you who touched a _line_. GitWho tells you who owns a
_component_: every directory, subsystem, and era of your repository, ranked by
author. It ships as a dependency-free Go CLI **and** a local web UI with
interactive table, file-browser, and history views.

## Features

- **Table view** — rank every author by commits, lines changed, files touched,
  or first/last edit.
- **Tree view** — browse any directory like a file explorer; each node shows
  its top contributor.
- **History view** — a timeline of who dominated each month or year.
- **Web UI** — point at any local repo _or_ paste a GitHub link; filter,
  sort, and explore in the browser. Dark mode included.
- **JSON output** — every view doubles as a machine-readable API for
  scripting (`--json`) and for powering the web UI.
- **Smart filtering** — by revision range, path, author, and date.
- **Streaming engine** — history is parsed as it arrives; memory stays flat on huge repos.

## Quickstart

### Install

Requires Go:

```bash
go install github.com/GrrrGe/git-who@latest
```

Or build from source (only Go needed — zero dependencies):

```bash
git clone https://github.com/GrrrGe/git-who.git
cd git-who
make build
./git-who --version
```

### Launch the web UI

```bash
git-who serve --repo /path/to/your/repo
# open http://127.0.0.1:8080/?repo=/path/to/your/repo
```

No `--repo`? Just open `http://127.0.0.1:8080/` — the landing page takes a
GitHub link (`owner/repo` or a full URL, cloned to your cache on demand) or a
local path. Click the glowing **?** anytime for the built-in use-case guide.

### Try the CLI

```bash
cd /path/to/your/repo
git-who                 # top authors by commits
git-who -l              # rank by lines added + removed
git-who tree internal/  # who owns each directory under internal/
git-who hist            # year-by-year timeline of top authors
```

(`git who` also works if `git-who` is on your `PATH` — Git picks it up
automatically.)

## Web UI

`git-who serve [--port 8080] [--repo /path/to/repo]` starts a localhost
server (it binds `127.0.0.1` only). The UI is a dependency-free single-page
app embedded in the binary — no runtime services, no accounts, no telemetry.

- **Landing** — a single search box. Paste a GitHub link or local path and hit
  Analyze.
- **Table** — sortable, filterable author ledger with commits, files,
  lines (+/-), and first/last edit columns.
- **Tree** — GitHub-style file browser with breadcrumbs; every row shows the
  top contributor and their metric for the selected mode.
- **History** — bar chart of commit activity per period with the winning
  author and period totals.
- **Filters button** — revision, path, author include/exclude, a calendar
  date-range picker, email display, and merge/hidden-file toggles, all behind
  one popover with an active-count badge.
- **Guide (?)** — use-case showcase plus the full CLI reference, built into
  the app.

### HTTP API

The frontend talks to these endpoints; you can use them directly. All take a
`repo` (local path or GitHub link) and return JSON:

| Endpoint      | Result                                              |
| ------------- | --------------------------------------------------- |
| `/api/table`  | Ranked authors with commits/files/lines/edit times  |
| `/api/tree`   | Nested file tree with top contributor per node      |
| `/api/hist`   | Per-period buckets with winner, value, and total    |
| `/api/resolve`| Resolve a link/path to a local checkout directory  |

Query parameters mirror the CLI flags: `rev` (repeatable, default `HEAD`),
`path` (repeatable pathspec), `mode` (`commits`/`lines`/`files`/
`last_modified`/`first_modified`), `author` / `nauthor` (repeatable),
`since`, `until`, `limit`, `depth`, `email=1`, `hidden=1`, `merges=1`.

## CLI reference

```
git-who [-v] [subcommand] [options...] [revisions...] [[--] paths...]
```

With no subcommand, `table` runs by default.

### `table` — rank authors

```
git-who table [-l | -f | -m | -c] [-n 10] [-e] [--merges] [--csv | --json]
```

Sort flags (mutually exclusive): `-l` lines added+removed (adds `Files` and
`Lines (+/-)` columns), `-f` files changed, `-m` last edit, `-c` first edit.
`-n` caps rows (`-n 0` prints all), `-e` keys authors by email, `--csv` and
`--json` switch the output format.

### `tree` — top contributor per path

```
git-who tree [-l | -f | -m | -c] [-d depth] [-a] [-e] [--merges] [--json]
```

Annotates each node with its leading author; files matching their parent
directory's winner are left unannotated to cut noise. `-d` limits depth,
`-a` annotates every file (including paths gone from the working tree).

### `hist` — timeline

```
git-who hist [-l | -f] [-e] [--merges] [--json]
```

Buckets auto-size (daily/monthly/yearly) to the range. Each row names the
period winner; the solid bar is their share, the faint bar the period total.

### Filtering (all subcommands)

- `--author` / `--nauthor` — include/exclude by author (repeatable).
- `--since` / `--until` — date bounds, any format `git log` accepts.
- `revisions...` — branch, tag, commit, or range (`v3.10..v3.11`); defaults to
  `HEAD`. Use `--` to disambiguate paths from revisions.
- Only the `exclude` pathspec magic is supported (`':!*.c'`).

### JSON shapes

```bash
git-who table --json -n 2
git-who tree --json
git-who hist --json
```

- `table`: `{ "mode", "authors": [{ "name", "email", "commits", "files",
  "lines_added", "lines_removed", "first_edit", "last_edit" }] }`
- `tree`: `{ "mode", "root": { "name", "path", "is_dir", "in_work_tree",
  "author", "metrics", "value", "children": [...] } }` (recursive; `value`
  is the ranking metric for the mode)
- `hist`: `{ "mode", "buckets": [{ "period", "start", "author", "metrics",
  "value", "total" }] }`

All timestamps are RFC 3339. Omitting `--json` leaves the classic text output
byte-identical.

## How it counts

- **Commits** — unique commits touching the selected paths (history
  simplification applies, as with `git log`).
- **Files** — unique files touched per author (renames follow the new path).
- **Lines** — added + removed via `--numstat`; editing a line counts as one
  removal plus one addition.
- **Merge commits** are skipped by default (their changes already appear via
  ancestors); pass `--merges` to count them toward commit totals.
- Respects `.mailmap` for unifying author identities and
  `.git-blame-ignore-revs` for skipping commits.
- Remote links are cloned once under `XDG_CACHE_HOME/git-who/remote`
  (`~/.cache` by default) and refreshed with `git fetch` on each visit.

## Development

```bash
make build   # build ./git-who
make test    # go unit tests (stdlib only, no test frameworks)
make vet     # static analysis
```

The web UI lives in `web/` (Vite + vanilla TypeScript, build-time only):

```bash
cd web && npm install && npm run build   # emits internal/serve/dist/
```

`internal/serve/dist/` is committed so a plain `make build` always produces
a working `git-who serve` — the bundle is embedded via `go:embed`.

## Docker

```bash
docker build -t git-who .
docker run --rm -it -v "$(pwd)":/git git-who table
```

## License

MIT — see [LICENSE](./LICENSE).
