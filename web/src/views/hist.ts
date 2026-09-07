import type { HistResp } from '../api';
import { authorColor, esc } from '../state';

export function renderHist(host: HTMLElement, data: HistResp) {
  const max = Math.max(1, ...data.buckets.map((b) => b.total));
  const leader = data.buckets.reduce((acc, b) => (b.value > (acc?.value ?? -1) ? b : acc), data.buckets[0]);
  const rows = data.buckets.map((b) => {
    const winPct = (b.value / max) * 100;
    const restPct = ((b.total - b.value) / max) * 100;
    const label = `${b.period}: ${b.author.name || '(no commits)'} ${b.value}/${b.total}`;
    const who = b.author.name
      ? `<span class="dot" style="background:${authorColor(b.author.name)}" aria-hidden="true"></span>${esc(b.author.name)} (${b.value}/${b.total})`
      : `<span style="color:var(--muted)">no commits</span>`;
    return `<div class="hist-row" role="img" aria-label="${esc(label)}">
      <span>${esc(b.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${winPct}%"></span><span class="rest" style="width:${restPct}%"></span></span>
      <span class="who">${who}</span>
    </div>`;
  }).join('');
  host.innerHTML = `
    ${leader ? `<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${esc(leader.period)}</p>
      <h3>${esc(leader.author.name || '-')}</h3>
      <p class="body">${leader.value.toLocaleString()} of ${leader.total.toLocaleString()} in ${esc(leader.period)}</p>
    </div>` : ''}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${rows || '<p>No history.</p>'}</div>`;
}
