import './design.css';
import { initScrollAnims, initShrinkNav, refreshAnims } from './anim';
import { fetchHist, fetchTable, fetchTree, resolveRepo } from './api';
import { bindFilters } from './components/filters';
import { bindGuide, guideHTML } from './components/guide';
import { bindLanding, landingHTML } from './components/landing';
import { shellHTML } from './components/shell';
import { esc, state, type Mode, type View } from './state';
import { renderHist } from './views/hist';
import { renderTable } from './views/table';
import { renderTree } from './views/tree';

const INDEX_STEPS: Record<string, string[]> = {
  table: ['Reading commit history', 'Ranking authors'],
  tree: ['Reading commit history', 'Building file tree', 'Ranking nodes'],
  hist: ['Reading commit history', 'Bucketing periods'],
};

const INDEX_TITLES: Record<string, string> = {
  table: 'Indexing authors',
  tree: 'Indexing file tree',
  hist: 'Indexing history',
};

/** Indexing screen with animated progress. Returns a stop function. */
function showIndexing(host: HTMLElement, view: string): () => void {
  const repo = esc(state.repoName || state.repo);
  host.innerHTML = `
    <div class="indexing" role="status" aria-live="polite" data-aos="fade-up">
      <h2 class="display-md">${INDEX_TITLES[view] ?? 'Indexing'}</h2>
      <p class="legend">${repo}</p>
      <div class="index-bar" aria-hidden="true"><span></span></div>
      <p class="status body-sm" id="index-status">${INDEX_STEPS[view]?.[0] ?? 'Working'}…</p>
      <div class="index-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => undefined;
  }
  const steps = INDEX_STEPS[view] ?? ['Working'];
  let i = 0;
  const el = host.querySelector('#index-status');
  const timer = window.setInterval(() => {
    i = (i + 1) % steps.length;
    if (el) el.textContent = `${steps[i]}…`;
  }, 900);
  return () => window.clearInterval(timer);
}

async function renderView(host: HTMLElement) {
  const stop = showIndexing(host, state.view);
  try {
    if (state.view === 'table') renderTable(host, await fetchTable(), render);
    else if (state.view === 'tree') renderTree(host, await fetchTree(), render);
    else renderHist(host, await fetchHist());
  } catch (e) {
    host.innerHTML = `<p class="error" role="alert">Error: ${esc((e as Error).message)}</p>`;
  } finally {
    stop();
  }
}

function openGuide(from: 'landing' | 'app') {
  state.guideFrom = from;
  state.screen = 'guide';
  render();
}

function guideBack() {
  state.screen = state.guideFrom === 'app' && state.repo ? 'app' : 'landing';
  render();
}

export function render() {
  const app = document.getElementById('app')!;

  if (state.screen === 'guide') {
    app.innerHTML = guideHTML();
    bindGuide(app, guideBack);
    refreshAnims();
    return;
  }

  if (!state.repo) {
    state.screen = 'landing';
    app.innerHTML = landingHTML();
    bindLanding(app, analyze, () => openGuide('landing'));
    refreshAnims();
    return;
  }

  state.screen = 'app';
  app.innerHTML = shellHTML();

  app.querySelector('#brand-home')?.addEventListener('click', () => {
    state.repo = ''; state.repoName = ''; state.analyzeError = '';
    render();
  });
  app.querySelector('#brand-q')?.addEventListener('click', () => openGuide('app'));
  app.querySelector('#new-repo')?.addEventListener('click', () => {
    state.repo = ''; state.repoName = ''; state.analyzeError = '';
    render();
  });
  app.querySelector('#theme')?.addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.getAttribute('data-theme')
      ? root.getAttribute('data-theme') === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('git-who-theme', next);
  });

  app.querySelectorAll<HTMLButtonElement>('button[data-view]').forEach((b) => {
    b.onclick = () => { state.view = b.dataset.view as View; render(); };
  });
  app.querySelectorAll<HTMLButtonElement>('button[data-mode]').forEach((b) => {
    b.onclick = () => { state.mode = b.dataset.mode as Mode; state.tableSort = ''; render(); };
  });

  bindFilters(app, render);

  // Close popover on outside click / Escape.
  document.onpointerdown = (e) => {
    if (state.filtersOpen && !(e.target as HTMLElement).closest('.popover-wrap')) {
      state.filtersOpen = false;
      render();
    }
  };
  document.onkeydown = (e) => {
    if (e.key === 'Escape' && state.filtersOpen) {
      state.filtersOpen = false;
      render();
    }
  };

  renderView(app.querySelector<HTMLElement>('#view')!);
  refreshAnims();
}

async function analyze(input: string) {
  state.analyzing = true;
  state.analyzeError = '';
  state.landingInput = input;
  render();
  try {
    const r = await resolveRepo(input);
    state.repo = r.repo;
    state.repoName = r.name;
    state.collapsed.clear();
    state.analyzing = false;
    const url = new URL(location.href);
    url.searchParams.set('repo', input);
    history.replaceState(null, '', url);
    render();
  } catch (e) {
    state.analyzing = false;
    state.analyzeError = (e as Error).message;
    render();
  }
}

function init() {
  initScrollAnims();
  initShrinkNav();
  const saved = localStorage.getItem('git-who-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  const params = new URLSearchParams(location.search);
  const repo = params.get('repo');
  if (repo) {
    state.landingInput = repo;
    analyze(repo);
    return;
  }
  render();
}

init();
