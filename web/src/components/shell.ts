import { esc, state, type Mode, type View } from '../state';
import { filtersButtonHTML, filtersPanelHTML } from './filters';

export function modeButton(m: Mode, label: string, flag: string): string {
  return `<button class="tab" data-mode="${m}" aria-pressed="${state.mode === m}" title="${flag}">${label}</button>`;
}

export function shellHTML(): string {
  const viewBtn = (v: View, label: string) =>
    `<button class="tab" data-view="${v}" aria-pressed="${state.view === v}">${label}</button>`;
  return `
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${esc(state.repo)}">${esc(state.repoName || state.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${filtersButtonHTML()}${filtersPanelHTML()}</span>
    <button id="new-repo" class="btn btn-secondary">Change repo</button>
    <button id="theme" class="btn-icon" aria-label="Toggle theme">◐</button>
  </div>
  <div class="wrap">
    <div class="toolbar view-navigation">
      <div class="tabs" role="group" aria-label="Views">
      ${viewBtn('table', 'Table')} ${viewBtn('tree', 'Tree')} ${viewBtn('hist', 'History')}
      </div>
      <div class="tabs mode-tabs" role="group" aria-label="Rank by">
      ${modeButton('commits', 'Commits', 'default')} ${modeButton('lines', 'Lines', '-l')}
      ${modeButton('files', 'Files', '-f')} ${modeButton('last_modified', 'Last edit', '-m')}
      ${modeButton('first_modified', 'First edit', '-c')}
      </div>
    </div>
    <div id="view" role="region" aria-label="Repository results"><p class="legend">Loading…</p></div>
  </div>`;
}
