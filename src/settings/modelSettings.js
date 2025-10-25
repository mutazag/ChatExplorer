const KEY = 'ncb:modelDefault';

export function getDefaultModel() {
  try { return localStorage.getItem(KEY) || 'Claude Sonnet 4.5'; } catch { return 'Claude Sonnet 4.5'; }
}

export function setDefaultModel(name) {
  try { localStorage.setItem(KEY, name); } catch {}
}
