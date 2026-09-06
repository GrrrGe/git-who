import type { TreeNode, TreeResp } from '../api';
import { authorColor, esc, fmtDate, state } from '../state';

// GitHub-style file browser: one directory per screen with breadcrumbs,
// instead of the whole nested tree at once. Columns mirror the CLI's
// per-node annotation (top contributor + metric) plus last edit.

function findNode(root: TreeNode, path: string): TreeNode | null {
  if (!path) return root;
  let node: TreeNode = root;
  for (const seg of path.split('/')) {
    const next = (node.children || []).find((c) => c.name === seg && c.is_dir);
    if (!next) return null;
    node = next;
  }
  return node;
}

function metricLabel(): string {
  if (state.mode === 'lines') return 'Lines';
  if (state.mode === 'files') return 'Files';
  if (state.mode === 'last_modified') return 'Last edit';
  if (state.mode === 'first_modified') return 'First edit';
  return 'Commits';
}

function metricValue(n: TreeNode): string {
  if (state.mode === 'lines') return `+${n.metrics.lines_added.toLocaleString()} / -${n.metrics.lines_removed.toLocaleString()}`;
  if (state.mode === 'files') return n.metrics.files.toLocaleString();
  if (state.mode === 'last_modified') return fmtDate(n.metrics.last_edit);
  if (state.mode === 'first_modified') return fmtDate(n.metrics.first_edit);
  return n.metrics.commits.toLocaleString();
}

export function renderTree(host: HTMLElement, data: TreeResp, rerender: () => void) {
  if (!data.root) { host.innerHTML = '<p>No commits; tree is empty.</p>'; return; }

  const node = findNode(data.root, state.treePath) ?? data.root;
  const kids = (node.children || [])
    .filter((c) => c.in_work_tree)
    .sort((a, b) => Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name));

  const segs = state.treePath ? state.treePath.split('/') : [];
  const crumbs = [`<button data-crumb="" class="crumb" aria-label="Repository root">${esc(data.root.name === '.' ? (state.repoName || 'repo') : data.root.name)}</button>`];
  segs.forEach((s, i) => {
    const p = segs.slice(0, i + 1).join('/');
    crumbs.push(`<span aria-hidden="true">/</span> <button data-crumb="${esc(p)}" class="crumb">${esc(s)}</button>`);
  });

  const rows = kids.map((c) => {
    const icon = c.is_dir ? '📁' : '📄';
    const name = c.is_dir
      ? `<button data-enter="${esc(c.is_dir ? (state.treePath ? state.treePath + '/' + c.name : c.name) : '')}" class="linklike">${esc(c.name)}</button>`
      : `<span>${esc(c.name)}</span>`;
    return `<tr>
      <td><span aria-hidden="true">${icon}</span> ${name}</td>
      <td><span class="dot" style="background:${authorColor(c.author.name)}" aria-hidden="true"></span>${esc(c.author.name)}</td>
      <td>${esc(metricValue(c))}</td>
      <td style="color:var(--muted)">${fmtDate(c.metrics.last_edit)}</td>
    </tr>`;
  }).join('');

  host.innerHTML = `
    <div class="toolbar">
      <nav class="body" aria-label="Breadcrumb">${crumbs.join(' ')}</nav>
      <span class="spacer"></span>
      <span class="legend">Top contributor per node, color-coded by author.</span>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Files by top contributor">
      <thead><tr><th>Name</th><th>Top contributor</th><th>${metricLabel()}</th><th>Last edit</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="4">Empty directory.</td></tr>'}</tbody>
    </table></div>`;

  host.querySelectorAll<HTMLButtonElement>('button[data-crumb]').forEach((b) => {
    b.onclick = () => { state.treePath = b.dataset.crumb ?? ''; rerender(); };
  });
  host.querySelectorAll<HTMLButtonElement>('button[data-enter]').forEach((b) => {
    b.onclick = () => { state.treePath = b.dataset.enter ?? ''; rerender(); };
  });
}
