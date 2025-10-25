const listeners = new Map();
const state = {
  conversations: [],
  page: 1,
  pageSize: 25,
  selectedId: null,
  stats: null,
  selectedDataset: null,
  theme: 'light',
  leftPaneVisible: true,
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
  emit('theme:changed', getState());
}

export function setLeftPaneVisible(visible) {
  state.leftPaneVisible = !!visible;
  emit('pane:changed', getState());
}

