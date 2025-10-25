const listeners = new Map();
const state = {
  conversations: [],
  page: 1,
  pageSize: 25,
  selectedId: null,
  stats: null,
  modelDefault: 'Claude Sonnet 4.5',
  modelSession: null,
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

export function setModelDefault(name) {
  state.modelDefault = name;
  try { localStorage.setItem('ncb:modelDefault', name); } catch {}
  emit('model:changed', getState());
}

export function setModelSession(name) {
  state.modelSession = name;
  emit('model:changed', getState());
}

export function loadPersisted() {
  try {
    const m = localStorage.getItem('ncb:modelDefault');
    if (m) state.modelDefault = m;
  } catch {}
}
