const listeners = new Map();
// Use same breakpoint as layout collapse for a consistent "mobile view" definition
const __IS_MOBILE__ = (() => {
  try { return !!(window && window.matchMedia && window.matchMedia('(max-width: 860px)').matches); } catch { return false; }
})();

// localStorage keys — prefixed to avoid collision with other apps on the same origin
const STORAGE_KEYS = { theme: 'ce_theme', pane: 'ce_pane' };

function loadPersistedState() {
  try {
    return {
      theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light',
      // 'false' string means hidden; anything else (null, 'true') means visible
      leftPaneVisible: localStorage.getItem(STORAGE_KEYS.pane) !== 'false',
    };
  } catch {
    // intentionally silent: localStorage may be unavailable (private browsing, storage quota exceeded)
    return { theme: 'light', leftPaneVisible: true };
  }
}

function persistTheme(theme) {
  try { localStorage.setItem(STORAGE_KEYS.theme, theme); } catch {
    // intentionally silent: storage may be unavailable
  }
}

function persistPane(visible) {
  try { localStorage.setItem(STORAGE_KEYS.pane, String(visible)); } catch {
    // intentionally silent: storage may be unavailable
  }
}

const _persisted = loadPersistedState();

const state = {
  conversations: [],
  page: 1,
  pageSize: __IS_MOBILE__ ? 5 : 25,
  selectedId: null,
  stats: null,
  selectedDataset: null,
  theme: _persisted.theme,
  leftPaneVisible: _persisted.leftPaneVisible,
};

function emit(type, detail) {
  const fns = listeners.get(type) || [];
  for (const fn of fns) fn(detail);
}

export function on(type, fn) {
  listeners.set(type, [...(listeners.get(type) || []), fn]);
  return () => off(type, fn);
}

export function off(type, fn) {
  const arr = listeners.get(type) || [];
  listeners.set(type, arr.filter((f) => f !== fn));
}

export function getState() { return { ...state }; }

export function setConversations(conversations, stats = null) {
  state.conversations = conversations;
  state.stats = stats;
  state.page = 1;
  state.selectedId = conversations[0]?.id ?? null;
  emit('conversations:changed', getState());
}

export function setSelection(id) {
  state.selectedId = id;
  emit('selection:changed', getState());
}

export function setPage(page) {
  state.page = page;
  emit('page:changed', getState());
}

export function setSelectedDataset(dataset) {
  state.selectedDataset = dataset; // { id, path, name? }
  emit('dataset:selected', getState());
}

export function setTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  persistTheme(state.theme);
  emit('theme:changed', getState());
}

export function setLeftPaneVisible(visible) {
  state.leftPaneVisible = !!visible;
  persistPane(state.leftPaneVisible);
  emit('pane:changed', getState());
}

export function setError(message) {
  emit('error:occurred', { message });
}
