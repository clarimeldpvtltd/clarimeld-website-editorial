import { initCollapsibles, initJourney } from './ui/journey';
import { initToggles } from './ui/toggles';

const root = document.documentElement;
root.classList.add('js');

/* Mobile navigation drawer */
function initDrawer(): void {
  const button = document.querySelector<HTMLButtonElement>('#menu-btn');
  const drawer = document.querySelector<HTMLElement>('#mobile-drawer');
  if (!button || !drawer) return;

  const setOpen = (open: boolean, restoreFocus = false): void => {
    button.setAttribute('aria-expanded', String(open));
    drawer.dataset.open = String(open);
    if (!open && restoreFocus) button.focus();
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* Footer motion control. The operating-system reduced-motion setting is always respected in CSS. */
function initMotionToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const label = button?.querySelector<HTMLElement>('[data-motion-label]');
  if (!button || !label) return;

  const apply = (paused: boolean): void => {
    root.dataset.motion = paused ? 'paused' : 'auto';
    button.setAttribute('aria-pressed', String(paused));
    label.textContent = paused ? 'Resume motion' : 'Pause motion';
  };

  let paused = false;
  try {
    paused = window.sessionStorage.getItem('clarimeld-motion') === 'paused';
  } catch {
    paused = false;
  }
  apply(paused);

  button.addEventListener('click', () => {
    paused = root.dataset.motion !== 'paused';
    apply(paused);
    try {
      window.sessionStorage.setItem('clarimeld-motion', paused ? 'paused' : 'auto');
    } catch {
      /* storage can be unavailable; the toggle still works for this page */
    }
  });
}

/* Reveal sections as they scroll into view */
function initReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (items.length === 0) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        /* Reveal what is entering the viewport, and anything already above it
           (after an anchor jump, a reload mid-page or a fast scroll), so no
           section stays hidden behind the reader. */
        if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    /* threshold 0 and no margin: a tall section starts to appear as soon as its top edge
       enters, instead of waiting until 8% of its height is visible (which left
       a blank band under the heading on tall sections). */
    { rootMargin: '0px', threshold: 0 },
  );
  items.forEach((el) => observer.observe(el));
}

initDrawer();
initMotionToggle();
initReveal();
initToggles();
initJourney();
initCollapsibles();
