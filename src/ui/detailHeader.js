import { getState } from '../state/appState.js';
import { setHashForId } from '../router/hash.js';

/**
 * Renders the mobile conversation picker dropdown.
 * Hidden on desktop via CSS (.mobile-list { display: none });
 * visible on mobile (max-width: 860px) as a sticky header.
 * @returns {HTMLElement|null}
 */
export function renderDetailHeader() {
  try {
    const state = getState();
    const list = Array.isArray(state.conversations) ? state.conversations : [];
    if (!list.length) return null;
    const box = document.createElement('div');
    box.className = 'mobile-list';
    box.setAttribute('data-mobile-list', '');
    const label = document.createElement('label');
    label.textContent = 'Conversation:';
    label.htmlFor = 'mobile-conv-select';
    const sel = document.createElement('select');
    sel.id = 'mobile-conv-select';
    sel.setAttribute('aria-label', 'Select conversation');
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const opt = document.createElement('option');
      opt.value = String(c.id);
      const title = c.title || `Conversation ${i + 1}`;
      opt.textContent = title;
      if (String(c.id) === String(state.selectedId)) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
      // Update hash so the app's hashchange listener sets selection and redraws
      setHashForId(sel.value);
    });
    box.appendChild(label);
    box.appendChild(sel);
    return box;
  } catch {
    // intentionally silent: mobile picker is progressive enhancement; failure returns null
    return null;
  }
}
