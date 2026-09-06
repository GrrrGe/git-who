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

async function renderView(host: HTMLElement) {
  try {
    if (state.view === 'table') renderTable(host, await fetchTable(), render);
    else if (state.view === 'tree') renderTree(host, await fetchTree(), render);
    else renderHist(host, await fetchHist());
  } catch (e) {
    host.innerHTML = `<p class="error" role="alert">Error: ${esc((e as Error).message)}</p>`;
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
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
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
    state.treePath = '';
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
