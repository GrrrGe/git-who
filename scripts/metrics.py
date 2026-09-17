#!/usr/bin/env python3
"""API metrics battery: latency percentiles, throughput, error budget.

 usage: scripts/metrics.py <base-url> <repo>
 Warms each endpoint once (primes the result cache), then measures.
 VLC-sized repos recommended for meaningful cold numbers; those are
 measured separately with a cleared cache (see README Performance).
"""
import concurrent.futures
import json
import sys
import time
import urllib.parse
import urllib.request

BASE, REPO = sys.argv[1], sys.argv[2]
LAT_N = 100
TP_WORKERS, TP_N = 8, 40


def get(path, params):
    qs = urllib.parse.urlencode([("repo", REPO)] + params)
    req = urllib.request.Request(f"{BASE.rstrip('/')}/{path}?{qs}")
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            body = r.read()
            return time.perf_counter() - t0, r.status, len(body)
    except Exception as e:  # noqa: BLE001 - any failure counts against budget
        return time.perf_counter() - t0, f"ERR {e}", 0


def pct(xs, p):
    xs = sorted(xs)
    k = (len(xs) - 1) * p / 100
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)


ENDPOINTS = {
    "table": ("api/table", []),
    "tree": ("api/tree", []),
    "hist": ("api/hist", []),
}

errors = 0
print(f"{'endpoint':<8} {'n':>5} {'p50':>9} {'p99':>9} {'max':>9} {'errors':>7}")
for name, (path, params) in ENDPOINTS.items():
    get(path, params)  # warm prime
    ds, codes = [], []
    for _ in range(LAT_N if name != "tree" else 25):
        d, code, _ = get(path, params)
        ds.append(d * 1000)
        codes.append(code)
    bad = sum(1 for c in codes if c != 200)
    errors += bad
    n = len(ds)
    print(f"{name:<8} {n:>5} {pct(ds,50):>8.0f}ms {pct(ds,99):>8.0f}ms "
          f"{max(ds):>8.0f}ms {bad:>7}")

# throughput: concurrent warm table reads
t0 = time.perf_counter()
with concurrent.futures.ThreadPoolExecutor(max_workers=TP_WORKERS) as ex:
    futs = [ex.submit(get, "api/table", []) for _ in range(TP_N)]
    results = [f.result() for f in futs]
dt = time.perf_counter() - t0
bad = sum(1 for _, code, _ in results if code != 200)
errors += bad
print(f"throughput: {TP_N/dt:.1f} rps ({TP_N} warm table reads, "
      f"{TP_WORKERS} workers, {bad} errors)")

print(f"error budget: {errors} failed requests in "
      f"{LAT_N + 25 + LAT_N + TP_N} total")
print(json.dumps({"ok": errors == 0}))
