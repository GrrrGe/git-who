import { typewriter } from '../anim';
import { esc, state } from '../state';

// Clean Google-style landing: wordmark + search only.
// The headline types itself in pure JS, then swaps to the styled wordmark
// (blue "Git", glowing "?" link to the Guide). Use cases live on the Guide.

const WORDMARK = `<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>`;

function paintWordmark(root: HTMLElement, onGuide: () => void) {
  const h1 = root.querySelector<HTMLElement>('#wordmark');
  if (!h1) return;
  h1.innerHTML = WORDMARK;
  h1.querySelector('#brand-q')?.addEventListener('click', (e) => {
    e.preventDefault();
    onGuide();
  });
}

export function landingHTML(): string {
  const busy = state.analyzing;
  const err = state.analyzeError
    ? `<p class="error" role="alert">${esc(state.analyzeError)}</p>` : '';
  return `
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?"></h1>
    <p class="subhead sub" data-aos="fade-up" data-aos-delay="150">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form" data-aos="fade-up" data-aos-delay="250">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${esc(state.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${busy ? 'disabled' : ''} />
        <button class="btn btn-primary" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Cloning…' : 'Analyze'}</button>
      </div>
    </form>
    ${err}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`;
}

export function bindLanding(
  root: HTMLElement,
  onAnalyze: (input: string) => void,
  onGuide: () => void,
) {
  const h1 = root.querySelector<HTMLElement>('#wordmark');
  if (h1 && !state.analyzing) {
    typewriter(h1, 'GitWho?', 110, () => paintWordmark(root, onGuide));
  } else if (h1) {
    paintWordmark(root, onGuide);
  }

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
