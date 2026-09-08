# GitWho: Interview Study Guide

Read top to bottom. Each section: what the file does, the ideas that matter,
and the exact sentences to use in interviews. Try every command shown.

## Phase 0: Run it (15 min)

```bash
export PATH="/opt/homebrew/bin:$PATH"
make build && ./git-who table -n 3
./git-who tree -d 1 | head -12
./git-who hist | head -6
./git-who table --json -n 1 | head -14
./git-who serve --port 18080              # UI on 127.0.0.1:18080
```

Say: "I always verify behavior on a real repo before describing it."

## Phase 1: Entry points (30 min)

### `go.mod` (3 lines)
Module path `github.com/GrrrGe/git-who`, Go 1.23, zero dependencies.
Say: "Stdlib-only backend. No supply-chain risk, `go build` works offline,
tiny binary."

### `Makefile` (23 lines)
`build` stamps version/commit via ldflags. `install` copies to `GOPATH/bin`.
`test`, `vet`, `clean`.
Say: "Version comes from git at build time, so `--version` always traces a
binary to a commit."

### `main.go` (353 lines)
Flag parsing and dispatch only. Pattern per subcommand: define FlagSet,
parse, resolve revs/paths, call `app.*`, render via `output.*`.
Key details:

- `escapeDashDash`: the stdlib `flag` package eats a lone `--`, but rev/path
  splitting needs it. Hidden with a `\x00` prefix before parse, restored
  after. Say: "I worked around a stdlib limitation instead of vendoring a
  CLI framework."
- Default subcommand is `table` when the first arg starts with `-`.
- `--json` paths call `app.TableJSON/TreeJSON/HistJSON` (cached). Text paths
  call `app.Table/Tree/Hist` (fresh). Same request struct either way.
- `splitRevs` rejects non-exclude pathspec magic (`:(...)` without
  "exclude").

Interview lines: "main is dumb by design. All logic lives in testable
packages; main only translates flags into one Request struct."

### `Dockerfile` (9 lines), `.gitignore`
Multi-stage: Go build, then scratch binary into alpine. Say: "Nine lines.
No build tools in the final image."

## Phase 2: Git layer (1 hr)

### `internal/git/git.go`
Five jobs: run git, split revs/paths, stream log, list worktree files, read
repo metadata. Read in this order:

1. `Filters.ToArgs`: `--since/--until/--author` pass through. There is no
   `--nauthor` in git, so exclusions become one `--perl-regexp --author
   '^((?!a|b).*)$'` negative lookahead. Say: "I encoded a missing git
   feature with a regex the tool already supports."
2. `SplitArgs`: delegates disambiguation to `git rev-parse --no-flags --`.
   40-hex lines before the first non-hash are revs; rest are paths. Empty
   revs default to `HEAD`.
3. `Stream`: builds `git -c core.quotePath=false log --pretty=format:... -z
   --reverse`, pipes stdout, parses on a goroutine into a buffered channel
   (cap 64). `wait()` joins parser errors with the subprocess exit plus
   stderr text. Say: "Backpressure is free: if consumers are slow, the
   channel fills and the parser blocks. Memory stays flat on 850 MB repos."
4. Parser layout per commit: six NUL fields (hash, short, parents, author,
   email, unix time), then NUL-separated numstat lines. A token without a
   tab ends the block and is held as lookahead for the next commit. Binary
   files (`-\t-`) count zero lines. **Renames arrive as three tokens**
   (`added\tremoved\t`, old, new); keep the destination. This crashed the
   first version; the fix has a dedicated test.
5. `Root`, `WorkTreeFiles` (`ls-files -z`), `HasMailmap`, `IgnoreRevs`
   (skips `#` comments), `ResolveRev` (expands one rev for cache keys).

Try: `git -c core.quotePath=false log --pretty='format:%H%x00...' -z
--numstat -3 | tr '\000' '\n' | head` to see the raw protocol.

## Phase 3: Stats engine (1 hr)

### `internal/stats/stats.go`
- `Mode` + `NeedsDiffs`: lines/files modes fetch diffs; commit modes skip
  `--numstat` entirely (major speedup on huge repos).
- `accumulator` holds **sets** (`commits`, `files` maps), never counters.
  Merges skipped unless requested, and even then contribute only commits,
  never lines/files (their changes exist via ancestors).
- `Summarize` folds the channel into one `Author` per key (name, or email
  with `-e`). `Sort`: mode value desc, ties by most-recent activity, then
  name. `Rank` copies, sorts, truncates, reports the cut count.

Say: "Sets make recounting impossible by construction. One commit touching
five files counts once for commits, five times never."

### `internal/stats/tree.go`
Tally per author per path, hang on a tree rebased from repo root to cwd,
roll children up by merging accumulators, pick each node's winner.
`SortedChildren`: directories first, then alphabetical.

Two subtleties worth naming:

- `rebase` resolves symlinks on both sides first. macOS `/tmp` is a symlink
  farm; without this the whole tree silently emptied. Lesson: "Test against
  real checkouts, not just unit fixtures."
- `mergeAccumulators` unions sets and sums lines, min/max dates. Shared by
  tree rollup and hist totals.

### `internal/stats/hist.go`
Bucket daily, widen by span (>60d monthly, >5y yearly), dense series from
first commit through end (`now` for HEAD queries) so gaps render. Winners
re-picked per display mode. Output order is **newest-first** (reversed
before return; tests assert both ends).

## Phase 4: App, output, cache (45 min)

### `internal/app/app.go` + `json.go`
`Request` mirrors CLI flags and API params. `Table/Tree/Hist` open a stream,
compute, wait. The `*JSON` variants wrap them with the disk cache.

Cache key (`fingerprint`): view + repo root + **rev-parse-resolved SHAs**
+ every flag + `.mailmap`/`.git-blame-ignore-revs` contents. New commits
change SHAs, so staleness is impossible by construction. Key version is
currently `v2`; bump it if shapes or semantics change. Measured: VLC tree
57s cold, 0.04s warm, byte-identical.

### `internal/output/output.go`
Text tables (own box-drawing renderer, thousands separators, relative
times), dotted-leader trees (same-winner children render bare), `#`/`-`
hist bars scaled to a 36-col peak. Hist labels pad to the widest label so
bars align. JSON builders use the exact field names the web client expects.

### `internal/cache/cache.go`
`Fingerprint` (sha256 hex), `Get`/`Set` with atomic write (temp + rename)
under `XDG_CACHE_HOME/git-who/results`. Best-effort: all errors degrade to
recompute. Say: "Cache never fails a request; worst case it recomputes."

## Phase 5: Server + APIs (45 min)

### `internal/serve/serve.go`
Four endpoints: `/api/table|tree|hist|resolve`, plus static file serving of
the embedded bundle. Flow per request: parse params → `resolveRepo` (local
path used as-is; remote link cloned once to
`~/.cache/git-who/remote/<slug>-<sha12>/`, then `git fetch` per visit) →
validate (`git rev-parse --show-toplevel`) → lock mutex, `chdir`, compute,
restore.

Say: "Git works off process cwd, so requests serialize behind a gate that
parks the process in each repo. Fifteen lines instead of threading a repo
dir through twenty signatures. Correct for localhost; I would not
multi-tenant it."

Try: `curl "127.0.0.1:8080/api/table?repo=/path&mode=lines&limit=2"`,
`curl ".../api/resolve?repo=owner/repo"`.

## Phase 6: Web UI (1 hr)

### `web/src/api.ts`, `state.ts`
Typed fetch clients; single `state` object (repo, rev, mode, view, filters,
sort, collapsed set). `buildParams` serializes state to the API.

### `web/src/main.ts`
Router in ~40 lines: `screen` is `landing | app | guide`. `renderView`
paints the Indexing screen, awaits fetch, swaps content, always clears the
status timer. Outside-click/Escape closes the filter popover.

### `components/landing.ts`, `shell.ts`, `filters.ts`, `guide.ts`
Landing: typewriter headline (pure JS, instant under reduced-motion) that
swaps in the styled wordmark. Shell: topbar, view tabs, mode tabs.
Filters: everything behind one button with active-count badge; date range
opens a native `<dialog>` with a hand-built month grid (click-click range,
presets). Guide: use cases + CLI reference.

### `views/table.ts`, `tree.ts`, `hist.ts`
Table: sort by header, **tbody-only** filtering (full re-render kills input
focus mid keystroke: found by testing, not by reading), custom suggestion
dropdown pinned under the input, prefix matches ranked first. Tree: nested
`<details>` mirroring the terminal, root levels open, Expand/Collapse all.
Hist: newest-first rows, peak card, muted "no commits" for gaps.

### `anim.ts`, `design.css`, `index.html`
AOS via CDN for landing/guide only (data views re-render constantly;
animating them looked unpolished). Shrink-on-scroll topbar. Typewriter +
caret. Indexing shimmer/pulse with reduced-motion off-ramps. Design tokens:
canvas `#090909`, single blue `#0099ff`, white pills, gradient spotlights.

### `web/shot.mjs`, `screenshots/gen.go`
Reproducible docs: `shot.mjs` drives installed Chrome headless (dark,
1280px) after `serve --port 18083`; `gen.go` (`//go:build ignore`) renders
terminal SVGs from real output of any repo path. Tree capture needs a 240s
timeout on giant repos (cold compute, not a UI bug).

## Phase 7: Mock Q&A (say out loud)

1. Walk me through an Analyze click. Resolve (clone/fetch or local) →
   validate → lock/chdir → fingerprint → cache hit? serve : compute →
   JSON → render, Indexing screen meanwhile.
2. How do you know the cache never lies? Resolved SHAs in the key.
3. Why subprocess git instead of a library? Zero deps, exact git semantics
   (mailmap, renames, rev-parse) for free, no cgo.
4. Memory on huge repos? Streaming channel, cap 64, backpressure natural.
5. Renames? Three-token NUL split, keep destination, dedicated test.
6. Why exclude merges? Graph bookkeeping; counting them rewards branching
   style over changes.
7. Empty tree? Typed `errEmptyTree`, CLI exits silent 0, API returns
   `"root": null`.
8. Tie in ranking? Mode value, then most recent, then name.
9. Why chdir+mutex? Cheapest correct isolation for localhost; documented
   as non-multi-tenant.
10. Why vanilla TS, no React? 25 KB bundle, forms+tables need no VDOM.
11. Why commit `dist/`? `go:embed` needs it at build; clones build offline.
12. Slowest cold run? VLC tree ~57s single-threaded; next step is sharded
    `git log` over rev ranges merged afterward.
13. Text output uncached: deliberate? Yes, --json/API share cache; text
    always fresh. Would unify with more time.
14. Time zones? Unix times, local bucketing, RFC 3339 JSON, relative text.
15. Biggest real bug? Rename tokens, then symlink cwd. Both found by
    running against real repos.

## Cheat sheet (one line per file)

`main.go`: flags in, Request out. `git.go`: git protocol + streaming
parser. `stats.go`: sets, ranks, modes. `tree.go`: rollup + rebase.
`hist.go`: bucket, widen, newest-first. `app.go`: orchestrate.
`json.go`: fingerprint + cache. `output.go`: text + JSON shapes.
`cache.go`: atomic disk entries. `serve.go`: params, resolve, gate, JSON.
`main.ts`: three screens. `table/tree/hist.ts`: one view each.
`filters.ts`: popover + calendar dialog. `design.css`: tokens + motion.
