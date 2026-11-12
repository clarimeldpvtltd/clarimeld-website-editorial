/* Example steps: an accessible tab list. Stage chips in the overview jump to a step. Without JavaScript every step is shown in order. */

export function initJourney(): void {
  document.querySelectorAll<HTMLElement>('[data-journey]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    const stage = root.querySelector<HTMLElement>('[data-journey-stage]');
    if (tabs.length === 0 || tabs.length !== panels.length) return;

    const count = root.querySelector<HTMLElement>('[data-j-count]');
    let current = 0;
    const select = (index: number, focus: boolean, reveal = true): void => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        panel.hidden = i !== index;
      });
      if (stage) stage.dataset.product = panels[index]?.dataset.product ?? '';
      current = index;
      if (count) count.textContent = `Step ${index + 1} of ${tabs.length}: ${tabs[index]?.querySelector('strong')?.textContent ?? ''}`;
      if (focus) tabs[index]?.focus();
      if (reveal) tabs[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index, false));
      tab.addEventListener('keydown', (event: KeyboardEvent) => {
        const last = tabs.length - 1;
        let next = -1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = last;
        if (next >= 0) {
          event.preventDefault();
          select(next, true);
        }
      });
    });

    root.querySelector('[data-j-prev]')?.addEventListener('click', () => select(Math.max(0, current - 1), false));
    root.querySelector('[data-j-next]')?.addEventListener('click', () => select(Math.min(tabs.length - 1, current + 1), false));

    // Overview chips and Suite links open the matching step in the example
    const section = root.closest('section');
    section?.querySelectorAll<HTMLAnchorElement>('a[data-goto]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const index = Number(link.dataset.goto);
        if (Number.isNaN(index) || !tabs[index]) return;
        event.preventDefault();
        select(index, false, false);
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'paused';
        (root.previousElementSibling ?? root).scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
        panels[index]?.focus({ preventScroll: true });
      });
    });

    select(0, false, false);
  });
}

/* Lanes and Suite links: open on desktop, collapsed by default on small screens. Without JavaScript they stay open. */
export function initCollapsibles(): void {
  const items = Array.from(document.querySelectorAll<HTMLDetailsElement>('details[data-collapsible]'));
  if (items.length === 0) return;
  const mq = window.matchMedia('(max-width: 960px)');
  const apply = (): void => {
    items.forEach((d) => {
      d.open = !mq.matches;
      const summary = d.querySelector('summary');
      if (summary) summary.tabIndex = mq.matches ? 0 : -1;
    });
  };
  items.forEach((d) => {
    d.querySelector('summary')?.addEventListener('click', (event) => {
      if (!mq.matches) event.preventDefault(); // not collapsible on desktop
    });
  });
  apply();
  mq.addEventListener('change', apply);
}
