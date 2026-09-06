export type Mode = 'commits' | 'lines' | 'files' | 'last_modified' | 'first_modified';
export type View = 'table' | 'tree' | 'hist';
export type Screen = 'landing' | 'app' | 'guide';

export const state = {
  repo: '',
  repoName: '',
  rev: 'HEAD',
  path: '',
  mode: 'commits' as Mode,
  view: 'table' as View,
  since: '',
  until: '',
  author: '',
  nauthor: '',
  email: false,
  merges: false,
  hidden: false,
  tableSort: '' as string,
  tableSortDir: -1 as number,
  tableFilter: '',
  collapsed: new Set<string>(),
  treePath: '' as string,
  filtersOpen: false,
  screen: 'landing' as Screen,
  guideFrom: 'landing' as 'landing' | 'app',
  landingInput: '',
  analyzing: false,
  analyzeError: '',
};

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function authorColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 65% 50%)`;
}

export function fmtDate(s: string): string {
  if (!s || s.startsWith('0001-')) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString();
}

export function activeFilterCount(): number {
  let n = 0;
  if (state.rev && state.rev !== 'HEAD') n++;
  if (state.path) n++;
  if (state.since) n++;
  if (state.until) n++;
  if (state.author) n++;
  if (state.nauthor) n++;
  if (state.email) n++;
  if (state.merges) n++;
  if (state.hidden) n++;
  return n;
}

export function buildParams(): URLSearchParams {
  const p = new URLSearchParams();
  if (state.repo) p.set('repo', state.repo);
  if (state.rev) p.set('rev', state.rev);
  if (state.path) p.set('path', state.path);
  p.set('mode', state.mode);
  if (state.since) p.set('since', state.since);
  if (state.until) p.set('until', state.until);
  if (state.author) p.set('author', state.author);
  if (state.nauthor) p.set('nauthor', state.nauthor);
  if (state.email) p.set('email', '1');
  if (state.merges) p.set('merges', '1');
  if (state.hidden) p.set('hidden', '1');
  return p;
}
