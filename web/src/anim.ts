// Scroll + headline animation helpers.
// AOS (CDN, see index.html) handles fade-in-up; the nav shrink and the
// typewriter are pure CSS/vanilla JS. No extra libraries.

declare global {
  interface Window { AOS?: { init: (opts?: object) => void; refresh: () => void }; }
}

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let aosInit = false;

/** Call once at startup. */
export function initScrollAnims() {
  if (aosInit || !window.AOS || reducedMotion()) return;
  window.AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 40 });
  aosInit = true;
}

/** Call after every dynamic render so new [data-aos] nodes animate. */
export function refreshAnims() {
  if (aosInit && window.AOS && !reducedMotion()) window.AOS.refresh();
}

/** Shrink the top nav + add shadow once the user scrolls. Idempotent. */
export function initShrinkNav() {
  const onScroll = () => {
    document.querySelectorAll('.topbar').forEach((bar) => {
      bar.classList.toggle('scrolled', window.scrollY > 8);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Pure-JS typewriter: types `text` into `el` char by char, then calls
 * `done` (used to swap in the final styled wordmark). Respects
 * prefers-reduced-motion by finishing instantly.
 */
export function typewriter(el: HTMLElement, text: string, speedMs: number, done: () => void) {
  if (reducedMotion()) { done(); return; }
  el.classList.add('typing');
  let i = 0;
  const tick = () => {
    i++;
    el.textContent = text.slice(0, i);
    if (i < text.length) {
      window.setTimeout(tick, speedMs);
    } else {
      el.classList.remove('typing');
      done();
    }
  };
  tick();
}
