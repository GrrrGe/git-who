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

  host.innerHTML = `
    ${spotlight}
    <div class="toolbar">
      <div class="field suggest-wrap grow">Filter authors
        <input id="tf" class="input search-lg" type="search"
          value="${esc(state.tableFilter)}" placeholder="name or email"
          role="combobox" aria-expanded="false" aria-controls="suggest"
          aria-label="Filter authors" autocomplete="off" />
        <div id="suggest" class="suggest" role="listbox" aria-label="Author suggestions" hidden></div>
      </div>
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
  // typing. Suggestions render in a Google-style dropdown under the input.
  const tf = host.querySelector<HTMLInputElement>('#tf');
  const tbody = host.querySelector('#author-rows');
  const suggest = host.querySelector('#suggest');
  let activeIdx = -1;

  const matches = (): TableAuthor[] => {
    const f = state.tableFilter.toLowerCase().trim();
    if (!f) return data.authors.slice(0, 8);
    // Prefix matches first: name starting with the query outranks email
    // starts-with, which outranks a substring anywhere. Stable sort keeps
    // the ranked order inside each tier.
    return data.authors
      .filter((a) =>
        a.name.toLowerCase().includes(f) || a.email.toLowerCase().includes(f))
      .sort((a, b) => tier(a) - tier(b))
      .slice(0, 8);
  };

  const tier = (a: TableAuthor): number => {
    const f = state.tableFilter.toLowerCase().trim();
    if (a.name.toLowerCase().startsWith(f)) return 0;
    if (a.email.toLowerCase().startsWith(f)) return 1;
    return 2;
  };

  const highlight = (name: string): string => {
    const f = state.tableFilter.trim();
    if (!f) return esc(name);
    const i = name.toLowerCase().indexOf(f.toLowerCase());
    if (i < 0) return esc(name);
    return esc(name.slice(0, i)) + '<b class="hl">' +
      esc(name.slice(i, i + f.length)) + '</b>' + esc(name.slice(i + f.length));
  };

  const paintSuggest = () => {
    if (!suggest || !tf) return;
    const list = matches();
    if (!list.length) {
      suggest.innerHTML = '<div class="suggest-empty">No matching authors.</div>';
    } else {
      suggest.innerHTML = list.map((a, i) => `
        <button class="suggest-item${i === activeIdx ? ' active' : ''}" role="option"
          aria-selected="${i === activeIdx}" data-i="${i}">
          <span class="dot" style="background:${authorColor(a.name)}" aria-hidden="true"></span>
          <span>${highlight(a.name)}</span>
          <small style="color:var(--muted)">${esc(a.email)}</small>
        </button>`).join('');
      suggest.querySelectorAll<HTMLButtonElement>('.suggest-item').forEach((b) => {
        // mousedown beats input blur so the pick lands before close.
        b.addEventListener('mousedown', (e) => {
          e.preventDefault();
          pick(list[Number(b.dataset.i)]);
        });
      });
    }
    suggest.hidden = false;
    tf.setAttribute('aria-expanded', 'true');
  };

  const closeSuggest = () => {
    if (!suggest || !tf) return;
    suggest.hidden = true;
    tf.setAttribute('aria-expanded', 'false');
    activeIdx = -1;
  };

  const pick = (a: TableAuthor) => {
    state.tableFilter = a.name;
    if (tf) tf.value = a.name;
    if (tbody) tbody.innerHTML = rowsHTML(visibleRows(data));
    closeSuggest();
  };

  tf?.addEventListener('input', () => {
    state.tableFilter = tf.value;
    activeIdx = -1;
    if (tbody) tbody.innerHTML = rowsHTML(visibleRows(data));
    paintSuggest();
  });
  tf?.addEventListener('focus', () => {
    activeIdx = -1;
    paintSuggest();
  });
  tf?.addEventListener('keydown', (e) => {
    if (suggest?.hidden) return;
    const list = matches();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, list.length - 1);
      paintSuggest();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, -1);
      paintSuggest();
    } else if (e.key === 'Enter' && activeIdx >= 0 && list[activeIdx]) {
      e.preventDefault();
      pick(list[activeIdx]);
    } else if (e.key === 'Escape') {
      closeSuggest();
    }
  });
  tf?.addEventListener('blur', () => closeSuggest());
}
