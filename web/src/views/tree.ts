import type { TreeNode, TreeResp } from '../api';
import { authorColor, esc, fmtDate, state } from '../state';

// Nested tree like the terminal `tree` subcommand: one collapsible node per
// directory, each annotated with its top contributor and metric.

function metricValue(n: TreeNode): string {
  if (state.mode === 'lines') return `(+${n.metrics.lines_added.toLocaleString()} / -${n.metrics.lines_removed.toLocaleString()})`;
  if (state.mode === 'files') return `(${n.metrics.files.toLocaleString()})`;
  if (state.mode === 'last_modified') return `(${fmtDate(n.metrics.last_edit)})`;
  if (state.mode === 'first_modified') return `(${fmtDate(n.metrics.first_edit)})`;
  return `(${n.metrics.commits.toLocaleString()})`;
}

function visibleKids(n: TreeNode): TreeNode[] {
  return (n.children || []).filter((c) => state.hidden || c.in_work_tree);
}

function row(n: TreeNode, display: string): string {
  const icon = n.is_dir ? '📁' : '📄';
  return `<span aria-hidden="true">${icon}</span> <span class="path">${esc(display)}</span>
    <span><span class="dot" style="background:${authorColor(n.author.name)}" aria-hidden="true"></span>${esc(n.author.name)}</span>
    <span class="metric">${esc(metricValue(n))}</span>`;
}

function renderNode(n: TreeNode, depth: number): string {
  const kids = visibleKids(n);
  if (!n.is_dir || !kids.length) {
    return `<div class="tree-row" role="treeitem">${row(n, n.name)}</div>`;
  }
  // Root level open; deeper directories start collapsed.
  const open = depth < 1 ? 'open' : '';
  const inner = kids.map((c) => renderNode(c, depth + 1)).join('');
  return `<details class="tree-dir" ${open}>
    <summary class="tree-row" role="treeitem" aria-expanded="${open ? 'true' : 'false'}">${row(n, n.name + '/')}</summary>
    <div class="tree-kids" role="group">${inner}</div>
  </div>`;
}

export function renderTree(host: HTMLElement, data: TreeResp, rerender: () => void) {
  void rerender;
  if (!data.root) { host.innerHTML = '<p>No commits; tree is empty.</p>'; return; }
  const root = data.root;
  const kids = visibleKids(root);
  if (!kids.length) { host.innerHTML = '<p>No commits; tree is empty.</p>'; return; }

  host.innerHTML = `
    <div class="toolbar">
      <span class="body"><strong>${esc(root.name === '.' ? (state.repoName || 'repo') : root.name)}/</strong>
      <span style="color:var(--muted)">${esc(root.author.name)} ${esc(metricValue(root))}</span></span>
      <span class="spacer"></span>
      <button id="expand" class="btn btn-secondary">Expand all</button>
      <button id="collapse" class="btn btn-secondary">Collapse all</button>
    </div>
    <div class="card" role="tree" aria-label="File tree by top contributor">
      ${kids.map((c) => renderNode(c, 0)).join('')}
    </div>`;

  host.querySelector('#expand')?.addEventListener('click', () => {
    host.querySelectorAll('details.tree-dir').forEach((d) => {
      (d as HTMLDetailsElement).open = true;
    });
  });
  host.querySelector('#collapse')?.addEventListener('click', () => {
    host.querySelectorAll('details.tree-dir').forEach((d) => {
      (d as HTMLDetailsElement).open = false;
    });
  });
}
