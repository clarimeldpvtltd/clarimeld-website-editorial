/* Two small explainer toggles: "Separate / Connected" (home) and "Standalone / Connected" (Suite page). */

function wireSwitch(
  buttons: HTMLButtonElement[],
  onChange: (mode: string) => void,
): void {
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      onChange(button.dataset.gapMode ?? button.dataset.topologyMode ?? '');
    });
  });
}

export function initToggles(): void {
  /* Home: why Clarimeld */
  const gapButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-gap-mode]'));
  if (gapButtons.length > 0) {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.gap-diagram, .gap-mobile'));
    const note = document.querySelector<HTMLElement>('[data-gap-note]');
    const copy: Record<string, string> = {
      separate: 'Separate tools. Each team rebuilds the story.',
      connected: 'Linked tools. The decision and its reason can move with the work, and each team keeps its own workspace.',
    };
    wireSwitch(gapButtons, (mode) => {
      targets.forEach((el) => el.setAttribute('data-state', mode));
      if (note) note.textContent = copy[mode] ?? '';
    });
  }

  /* Suite page: standalone vs connected */
  const topologyButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-topology-mode]'),
  );
  const topology = document.querySelector<HTMLElement>('[data-topology]');
  if (topologyButtons.length > 0 && topology) {
    const note = topology.querySelector<HTMLElement>('[data-topology-note]');
    const copy: Record<string, string> = {
      standalone: 'Use one, two or all three. Nothing else is required.',
      connected:
        'Link them and context can move with the work: customer signals, decisions, agreed context and updates. Every link is optional.',
    };
    wireSwitch(topologyButtons, (mode) => {
      topology.dataset.state = mode;
      if (note) note.textContent = copy[mode] ?? '';
    });
  }
}
