import type { TableAuthor, TableResp } from '../api';
import { authorColor, esc, fmtDate, state, type Mode } from '../state';

function metricOf(a: TableAuthor, mode: Mode): number {
  if (mode === 'lines') return a.lines_added + a.lines_removed;
  if (mode === 'files') return a.files;
  return a.commits;
}

function visibleRows(data: TableResp): TableAuthor[] {
  const rows = data.authors.filter((a) => {
    const f = state.tableFilter.toLowerCase();
    return !f || a.name.toLowerCase().includes(f) || a.email.toLowerCase().includes(f);
  });

  const sortKey = state.tableSort || state.mode;
  rows.sort((x, y) => {
    let d = 0;
    if (sortKey === 'name') d = x.name.localeCompare(y.name);
    else if (sortKey === 'commits') d = x.commits - y.commits;
    else if (sortKey === 'files') d = x.files - y.files;
    else if (sortKey === 'lines') d = (x.lines_added + x.lines_removed) - (y.lines_added + y.lines_removed);
    else if (sortKey === 'last_edit') d = +new Date(x.last_edit) - +new Date(y.last_edit);
    else if (sortKey === 'first_edit') d = +new Date(x.first_edit) - +new Date(y.first_edit);
    else d = metricOf(x, state.mode) - metricOf(y, state.mode);
    return d * state.tableSortDir;
  });
  return rows;
}

function rowsHTML(rows: TableAuthor[]): string {
  if (!rows.length) return '<tr><td colspan="6">No authors.</td></tr>';
  return rows.map((a) => `
    <tr>
      <td><span class="dot" style="background:${authorColor(a.name)}" aria-hidden="true"></span>${esc(a.name)}<br/><small style="color:var(--muted)">${esc(a.email)}</small></td>
      <td>${a.commits.toLocaleString()}</td>
      <td>${a.files.toLocaleString()}</td>
      <td><span class="check">+${a.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${a.lines_removed.toLocaleString()}</span></td>
      <td>${fmtDate(a.last_edit)}</td>
      <td>${fmtDate(a.first_edit)}</td>
    </tr>`).join('');
}

export function renderTable(host: HTMLElement, data: TableResp, rerender: () => void) {
  const rows = visibleRows(data);

  const top = rows.slice(0, 3);
  const spotlight = top.length
    ?     `<div class="grid grid-3" style="margin-bottom:16px">
        ${top.map((a, i) => `
          <div class="card ${i === 0 ? 'card-featured level-2' : ''}">
            <p class="caption" style="color:var(--muted)">#${i + 1} · ${metricOf(a, state.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${authorColor(a.name)}" aria-hidden="true"></span>${esc(a.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${a.commits.toLocaleString()} commits · ${a.files.toLocaleString()} files · +${a.lines_added.toLocaleString()} / -${a.lines_removed.toLocaleString()}</p>
          </div>`).join('')}
      </div>`
    : '';

  const cols: Array<[string, string]> = [
    ['name', 'Author'], ['commits', 'Commits'], ['files', 'Files'],
    ['lines', 'Lines (+/-)'], ['last_edit', 'Last edit'], ['first_edit', 'First edit'],
  ];
  const th = cols.map(([k, label]) => {
    const active = (state.tableSort || state.mode) === k;
    const arrow = active ? (state.tableSortDir === -1 ? ' ▼' : ' ▲') : '';
    return `<th><button data-sort="${k}" aria-label="Sort by ${label}">${label}${arrow}</button></th>`;
  }).join('');

  const options = data.authors
    .map((a) => `<option value="${esc(a.name)}">${esc(a.email)}</option>`)
    .join('');

  host.innerHTML = `
    ${spotlight}
    <div class="toolbar">
      <label class="field">Filter authors
        <input id="tf" class="input" type="search" list="author-suggest"
          value="${esc(state.tableFilter)}" placeholder="name or email"
          aria-label="Filter authors" autocomplete="off" />
      </label>
      <datalist id="author-suggest">${options}</datalist>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Contributions by author">
      <thead><tr>${th}</tr></thead>
      <tbody id="author-rows">${rowsHTML(rows)}</tbody>
    </table></div>`;

  host.querySelectorAll<HTMLButtonElement>('button[data-sort]').forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.sort!;
      if ((state.tableSort || state.mode) === k) state.tableSortDir *= -1;
      else { state.tableSort = k; state.tableSortDir = -1; }
      rerender();
    };
  });

  // Filter in place: only the rows update, so the input keeps focus while
  // typing and the browser can offer datalist suggestions.
  const tf = host.querySelector<HTMLInputElement>('#tf');
  const tbody = host.querySelector('#author-rows');
  tf?.addEventListener('input', () => {
    state.tableFilter = tf.value;
    if (tbody) tbody.innerHTML = rowsHTML(visibleRows(data));
  });
}
