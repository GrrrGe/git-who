import { activeFilterCount, esc, state } from '../state';

// All analysis filters live behind a single Filters button (popover panel)
// instead of being displayed inline. The date range opens a dedicated dialog
// with a traditional month-grid calendar + quick presets.

function rangeLabel(): string {
  if (state.since || state.until) return `${state.since || '…'} → ${state.until || '…'}`;
  return 'All time 📅';
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOWS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function filtersButtonHTML(): string {
  const n = activeFilterCount();
  const badge = n ? ` <span class="badge" aria-label="${n} active filters">${n}</span>` : '';
  return `<button id="filters-btn" class="btn btn-secondary" aria-expanded="${state.filtersOpen}" aria-haspopup="dialog">Filters${badge}</button>`;
}

export function filtersPanelHTML(): string {
  if (!state.filtersOpen) return '';
  const checked = (v: boolean) => (v ? 'checked' : '');
  return `
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${esc(state.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${esc(state.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${esc(rangeLabel())}</button>
      </label>
      <label class="field">Author <input id="f-author" class="input" value="${esc(state.author)}" placeholder="--author" /></label>
      <label class="field">Exclude author <input id="f-nauthor" class="input" value="${esc(state.nauthor)}" placeholder="--nauthor" /></label>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <label class="body-sm"><input type="checkbox" id="f-email" ${checked(state.email)} /> Show email (-e)</label>
      <label class="body-sm"><input type="checkbox" id="f-merges" ${checked(state.merges)} /> Count merges</label>
      <label class="body-sm"><input type="checkbox" id="f-hidden" ${checked(state.hidden)} /> Show hidden files (-a)</label>
    </div>
    <div style="display:flex;gap:8px">
      <button id="f-apply" class="btn btn-primary">Apply</button>
      <button id="f-clear" class="btn btn-translucent">Clear</button>
    </div>
    <dialog id="date-dialog" class="date-dialog" aria-label="Select date range">
      <p class="headline" style="margin-top:0">Date range</p>
      <p class="legend" id="d-summary">All time</p>
      <div class="cal-nav">
        <button id="cal-prev" class="btn-icon" aria-label="Previous month">‹</button>
        <span id="cal-title" class="body-sm" aria-live="polite"></span>
        <button id="cal-next" class="btn-icon" aria-label="Next month">›</button>
      </div>
      <div class="cal-grid" id="cal-grid" role="grid" aria-label="Calendar: pick a start date, then an end date"></div>
      <div class="presets" style="margin:12px 0">
        <button class="btn btn-secondary" data-preset="30">Last 30 days</button>
        <button class="btn btn-secondary" data-preset="182">Last 6 months</button>
        <button class="btn btn-secondary" data-preset="365">Last year</button>
        <button class="btn btn-translucent" data-preset="all">All time</button>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="d-cancel" class="btn btn-translucent">Cancel</button>
        <button id="d-apply" class="btn btn-primary">Apply dates</button>
      </div>
    </dialog>
  </div>`;
}

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

export function bindFilters(root: HTMLElement, onChange: () => void) {
  const btn = root.querySelector<HTMLButtonElement>('#filters-btn');
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.filtersOpen = !state.filtersOpen;
    onChange();
  });

  const val = (id: string) => (root.querySelector<HTMLInputElement>(`#${id}`)?.value ?? '');
  const chk = (id: string) => (root.querySelector<HTMLInputElement>(`#${id}`)?.checked ?? false);
  const dialog = root.querySelector<HTMLDialogElement>('#date-dialog');

  // ---- Calendar state (temp until Apply) ----
  let cursor = monthStart(new Date());
  let selStart = '';
  let selEnd = '';

  const summary = () => {
    const el = dialog?.querySelector('#d-summary');
    if (!el) return;
    el.textContent = selStart || selEnd
      ? `${selStart || '…'} → ${selEnd || '…'}`
      : 'All time — click a day to set the start, click again for the end.';
  };

  const renderCal = () => {
    const grid = dialog?.querySelector('#cal-grid');
    const title = dialog?.querySelector('#cal-title');
    if (!grid || !title || !dialog) return;
    title.textContent = `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

    const today = toISO(new Date());
    const firstDow = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();

    let html = DOWS.map((d) => `<span class="cal-dow">${d}</span>`).join('');
    for (let i = 0; i < firstDow; i++) html += '<span></span>';
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toISO(new Date(cursor.getFullYear(), cursor.getMonth(), day));
      const isStart = iso === selStart;
      const isEnd = iso === selEnd && selEnd !== selStart;
      const inRange = selStart && selEnd && iso > selStart && iso < selEnd;
      const cls = ['cal-day', isStart || isEnd ? 'endpoint' : '', inRange ? 'in-range' : '', iso === today ? 'today' : '']
        .filter(Boolean).join(' ');
      const label = isStart ? ', range start' : isEnd ? ', range end' : '';
      html += `<button class="${cls}" data-day="${iso}" role="gridcell" aria-label="${iso}${label}">${day}</button>`;
    }
    grid.innerHTML = html;

    grid.querySelectorAll<HTMLButtonElement>('button[data-day]').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const d = b.dataset.day!;
        if (!selStart || (selStart && selEnd)) {
          selStart = d;
          selEnd = '';
        } else if (d < selStart) {
          selEnd = selStart;
          selStart = d;
        } else {
          selEnd = d;
        }
        renderCal();
      });
    });
    summary();
  };

  const openDialog = () => {
    if (!dialog) return;
    selStart = /^\d{4}-\d{2}-\d{2}/.test(state.since) ? state.since.slice(0, 10) : '';
    selEnd = /^\d{4}-\d{2}-\d{2}/.test(state.until) ? state.until.slice(0, 10) : '';
    const anchor = parseDate(selStart) ?? new Date();
    cursor = monthStart(anchor);
    renderCal();
    dialog.showModal();
  };

  root.querySelector('#f-dates')?.addEventListener('click', openDialog);

  dialog?.querySelector('#cal-prev')?.addEventListener('click', (e) => {
    e.preventDefault();
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    renderCal();
  });
  dialog?.querySelector('#cal-next')?.addEventListener('click', (e) => {
    e.preventDefault();
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    renderCal();
  });

  dialog?.querySelectorAll<HTMLButtonElement>('button[data-preset]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      if (b.dataset.preset === 'all') {
        selStart = '';
        selEnd = '';
      } else {
        const d = new Date();
        d.setDate(d.getDate() - Number(b.dataset.preset));
        selStart = toISO(d);
        selEnd = '';
        cursor = monthStart(d);
      }
      renderCal();
    });
  });

  const syncRangeLabel = () => {
    const label = root.querySelector('#f-dates');
    if (label) label.textContent = (state.since || state.until)
      ? `${state.since || '…'} → ${state.until || '…'}` : 'All time 📅';
  };

  root.querySelector('#d-apply')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.since = selStart;
    state.until = selEnd;
    dialog?.close();
    syncRangeLabel();
  });
  root.querySelector('#d-cancel')?.addEventListener('click', (e) => {
    e.preventDefault();
    dialog?.close();
  });

  root.querySelector<HTMLButtonElement>('#f-apply')?.addEventListener('click', () => {
    state.rev = val('f-rev') || 'HEAD';
    state.path = val('f-path');
    state.author = val('f-author');
    state.nauthor = val('f-nauthor');
    state.email = chk('f-email');
    state.merges = chk('f-merges');
    state.hidden = chk('f-hidden');
    // since/until are synced live by the date dialog.
    state.filtersOpen = false;
    onChange();
  });

  root.querySelector<HTMLButtonElement>('#f-clear')?.addEventListener('click', () => {
    state.rev = 'HEAD'; state.path = ''; state.since = ''; state.until = '';
    state.author = ''; state.nauthor = '';
    state.email = false; state.merges = false; state.hidden = false;
    state.filtersOpen = false;
    onChange();
  });
}
