import { esc, state } from '../state';

const WORDMARK = `<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>`;

export function landingHTML(): string {
  const busy = state.analyzing;
  const err = state.analyzeError
    ? `<p class="error" role="alert">${esc(state.analyzeError)}</p>` : '';
  return `
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?">${WORDMARK}</h1>
    <p class="subhead sub">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${esc(state.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${busy ? 'disabled' : ''} />
        <button class="btn btn-primary" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Opening…' : 'Analyze'}</button>
      </div>
    </form>
    ${err}
    <button id="howto" class="howto-link">How to use GitWho →</button>
  </div>`;
}

export function bindLanding(
  root: HTMLElement,
  onAnalyze: (input: string) => void,
  onGuide: () => void,
) {
  root.querySelector('#brand-q')?.addEventListener('click', (e) => {
    e.preventDefault();
    onGuide();
  });

  const form = root.querySelector<HTMLFormElement>('#landing-form');
  const input = root.querySelector<HTMLInputElement>('#landing-input');
  if (!state.analyzing) input?.focus();
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (input?.value ?? '').trim();
    if (v) onAnalyze(v);
  });
  root.querySelector('#howto')?.addEventListener('click', onGuide);
}
