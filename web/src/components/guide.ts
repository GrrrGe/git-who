import { state } from '../state';

// View descriptions and CLI reference. Reached via the "?" and the
// "How to use" link; back returns to wherever you came from.

export function guideHTML(): string {
  return `
  <div class="guide">
    <button id="guide-back" class="btn btn-secondary">← Back</button>
    <p class="caption" style="color:var(--muted);margin:32px 0 8px">Guide</p>
    <h1 class="display-lg">What can GitWho do?</h1>
    <p class="body-lg" style="color:var(--muted)">Three views over your git history, plus the CLI behind them.</p>

    <section class="grid grid-3">
      <div class="card">
        <p class="headline">Table</p>
        <p class="body-sm" style="color:var(--muted)">Sortable ledger of every author.</p>
      </div>
      <div class="card">
        <p class="headline">Tree</p>
        <p class="body-sm" style="color:var(--muted)">File browser. Top contributor per node.</p>
      </div>
      <div class="card">
        <p class="headline">History</p>
        <p class="body-sm" style="color:var(--muted)">Bar chart. Winner and totals per period.</p>
      </div>
    </section>

    <section>
      <h2 class="display-md">Prefer the terminal?</h2>
      <p class="body" style="color:var(--muted)">Same analysis, no browser:</p>
      <pre class="code"><span class="c"># Install the CLI (Go, or from source)</span>
go install github.com/GrrrGe/git-who@latest
git clone https://github.com/GrrrGe/git-who.git && cd git-who && make build

<span class="c"># Rank authors by commits, lines, files, last/first edit</span>
git who table -l -n 10
git who tree --author "Jane Doe" --since "6 months ago"
git who hist --since 2024-01-01

<span class="c"># Machine-readable output for scripting</span>
git who table --json | jq '.authors[0]'
git who tree --json | jq '.root.children[].name'
git who hist --json | jq '.buckets[].period'

<span class="c"># Serve this UI locally</span>
git-who serve --repo /path/to/repo</pre>
    </section>
  </div>`;
}

export function bindGuide(root: HTMLElement, onBack: () => void) {
  root.querySelector('#guide-back')?.addEventListener('click', onBack);
  void state;
}
