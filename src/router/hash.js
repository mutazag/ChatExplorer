export function parseHash() {
  const h = (location.hash || '').slice(1);
  // format: c:<id>
  if (!h.startsWith('c:')) return { id: null };
  return { id: decodeURIComponent(h.slice(2) || '') };
}

export function setHashForId(id) {
  const newHash = `#c:${encodeURIComponent(String(id))}`;
  if (location.hash !== newHash) location.hash = newHash;
}

export function onHashChange(cb) {
  window.addEventListener('hashchange', () => cb(parseHash()));
}
