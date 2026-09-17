#!/bin/bash
# Latency harness: runs a git-who command N times, reports min/p50/p99/max.
# Clears the result cache once up front, so run 1 is cold compute and the
# rest are cache hits. p99 therefore covers the worst realistic case.
#
# usage: scripts/bench.sh <repo> [runs] -- <git-who args...>
#   e.g. scripts/bench.sh ~/repos/vlc 7 -- tree --json
set -u

REPO="${1:?repo required}"
RUNS="${2:-7}"
shift 2
if [ "${1:-}" != "--" ]; then echo "usage: $0 <repo> [runs] -- <args...>" >&2; exit 2; fi
shift

BIN="${GITWHO_BIN:-./git-who}"
rm -rf "${XDG_CACHE_HOME:-$HOME/.cache}/git-who/results"

TIMES="$(mktemp)"
trap 'rm -f "$TIMES"' EXIT

for i in $(seq 1 "$RUNS"); do
  start=$(python3 -c 'import time; print(time.time())')
  (cd "$REPO" && "$BIN" "$@" > /dev/null) || exit 1
  end=$(python3 -c 'import time; print(time.time())')
  python3 -c "print($end - $start)" >> "$TIMES"
done

python3 - "$TIMES" <<'EOF'
import statistics, sys
ds = sorted(float(l) for l in open(sys.argv[1]) if l.strip())
def pct(xs, p):
    k = (len(xs) - 1) * p / 100
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)
print(f"runs={len(ds)} min={min(ds):.2f}s p50={pct(ds,50):.2f}s "
      f"p99={pct(ds,99):.2f}s max={max(ds):.2f}s")
EOF
