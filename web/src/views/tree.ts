import type { TreeNode, TreeResp } from '../api';
import { authorColor, esc, fmtDate, state } from '../state';

const expanded = new Set<string>();
let currentRepo = '';

function metricValue(n: TreeNode): string {
  if (state.mode === 'lines') return `+${n.metrics.lines_added.toLocaleString()} / −${n.metrics.lines_removed.toLocaleString()}`;
  if (state.mode === 'files') return n.metrics.files.toLocaleString();
  if (state.mode === 'last_modified') return fmtDate(n.metrics.last_edit);
  if (state.mode === 'first_modified') return fmtDate(n.metrics.first_edit);
  return n.metrics.commits.toLocaleString();
}

function visibleKids(n: TreeNode): TreeNode[] {
  return (n.children || []).filter((c) => state.hidden || c.in_work_tree);
}

function row(n: TreeNode, depth: number, expandable: boolean): string {
  const shape = n.is_dir
    ? '<path d="M2 5h5l2 2h13v12H2z"/>'
    : '<path d="M5 2h9l5 5v15H5z"/><path d="M14 2v6h5"/>';
  return `<span class="tree-name" style="--depth:${depth}" title="${esc(n.path)}">
    <span class="tree-chevron ${expandable ? '' : 'tree-chevron-empty'}" aria-hidden="true">›</span>
    <svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${shape}</svg>
    <span class="path">${esc(n.name)}${n.is_dir ? '/' : ''}</span>
    ${!n.in_work_tree ? '<span class="tree-deleted">deleted</span>' : ''}
    </span>
    <span class="tree-author" title="${esc(n.author.name)}"><span class="dot" style="background:${authorColor(n.author.name)}" aria-hidden="true"></span>${esc(n.author.name || 'No author')}</span>
    <span class="tree-metric">${esc(metricValue(n))}</span>`;
}

function renderNode(n: TreeNode, depth: number): string {
  const kids = visibleKids(n);
  if (!n.is_dir || !kids.length) return `<div class="tree-row">${row(n, depth, false)}</div>`;
  return `<details class="tree-dir" data-path="${esc(n.path)}" ${expanded.has(n.path) ? 'open' : ''}>
    <summary class="tree-row">${row(n, depth, true)}</summary>
    <div class="tree-kids">${kids.map((c) => renderNode(c, depth + 1)).join('')}</div>
  </details>`;
}

export function renderTree(host: HTMLElement, data: TreeResp, rerender: () => void) {
  void rerender;
  if (currentRepo !== state.repo) { expanded.clear(); currentRepo = state.repo; }
  const root = data.root;
  if (!root || !visibleKids(root).length) {
    host.innerHTML = '<p class="legend">No files match the current filters.</p>';
    return;
  }
  const label = { commits: 'Commits', lines: 'Lines (+ / −)', files: 'Files', last_modified: 'Last edit', first_modified: 'First edit' }[state.mode];
  host.innerHTML = `
    <section class="tree-browser" aria-label="Files by top contributor">
      <div class="tree-toolbar">
        <div class="tree-root"><strong>${esc(root.name === '.' ? (state.repoName || 'repo') : root.name)}/</strong>
          <span>${esc(root.author.name)} <span class="tree-root-metric">${esc(metricValue(root))}</span></span></div>
        <div class="tree-actions"><button id="expand" class="btn btn-secondary">Expand all</button>
          <button id="collapse" class="btn btn-secondary">Collapse all</button></div>
      </div>
      <div class="tree-scroll">
        <div class="tree-content">
          <div class="tree-head"><span>File</span><span>Top contributor</span><span>${label}</span></div>
          ${visibleKids(root).map((c) => renderNode(c, 0)).join('')}
        </div>
      </div>
    </section>`;

  const dirs = host.querySelectorAll<HTMLDetailsElement>('details.tree-dir');
  dirs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) expanded.add(d.dataset.path!);
    else expanded.delete(d.dataset.path!);
  }));
  const setOpen = (open: boolean) => dirs.forEach((d) => {
    d.open = open;
    if (open) expanded.add(d.dataset.path!);
    else expanded.delete(d.dataset.path!);
  });
  host.querySelector('#expand')?.addEventListener('click', () => setOpen(true));
  host.querySelector('#collapse')?.addEventListener('click', () => setOpen(false));
}
