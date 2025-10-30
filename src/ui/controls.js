import { getState, setTheme, setLeftPaneVisible, on } from '../state/appState.js';

export function initThemeToggle(buttonEl) {
  if (!buttonEl) return;
  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    buttonEl.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    buttonEl.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  };
  // initial
  const s = getState();
  apply(s.theme || 'light');
  // click handler
  buttonEl.addEventListener('click', () => {
    const cur = (getState().theme || 'light');
    const next = cur === 'light' ? 'dark' : 'light';
    setTheme(next);
  });
  on('theme:changed', (st) => apply(st.theme || 'light'));
}

export function initPaneToggle(buttonEl, { layoutEl, leftPaneEl } = {}) {
  if (!buttonEl) return;
  const layout = layoutEl || document.querySelector('.layout');
  const left = leftPaneEl || document.getElementById('left');
  const apply = (visible) => {
    buttonEl.setAttribute('aria-expanded', visible ? 'true' : 'false');
    if (layout) layout.classList.toggle('is-pane-hidden', !visible);
    if (left) left.toggleAttribute('hidden', !visible);
    // On narrow screens, the left pane is hidden by default via CSS; ensure it's forced visible when requested
    try {
      if (window.matchMedia && window.matchMedia('(max-width: 860px)').matches) {
        document.documentElement.classList.toggle('show-left', !!visible);
      }
    } catch { /* noop */ }
    buttonEl.textContent = visible ? 'Hide Pane' : 'Show Pane';
  };
  // initial
  apply(getState().leftPaneVisible !== false);
  // click handler
  buttonEl.addEventListener('click', () => {
    const cur = !!getState().leftPaneVisible;
    setLeftPaneVisible(!cur);
  });
  on('pane:changed', (st) => apply(!!st.leftPaneVisible));
}
