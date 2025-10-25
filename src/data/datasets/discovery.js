/**
 * Dataset discovery utilities for listing data/* subfolders that contain conversations.json.
 * Primary approach: parse directory index HTML for /data when served by a static server.
 * Validation: probe <candidate>/conversations.json via HEAD (fallback GET).
 */

async function probeConversations(path) {
  const url = `${path}/conversations.json`;
  const toIso = (v) => {
    try { return v ? new Date(v).toISOString() : undefined; } catch { return undefined; }
  };
  try {
    const head = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (head.ok) {
      const lm = head.headers.get('Last-Modified');
      return { ok: true, modifiedAt: toIso(lm) };
    }
  } catch (_) { /* noop */ }
  try {
    const get = await fetch(url, { method: 'GET', cache: 'no-store' });
    const lm = get.headers.get('Last-Modified');
    return { ok: !!get.ok, modifiedAt: toIso(lm) };
  } catch (_) {
    return { ok: false };
  }
}

async function parseDirectoryIndex(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a[href]'));
    const names = anchors
      .map((a) => a.getAttribute('href') || '')
      .filter((href) => href && !href.startsWith('../') && href.endsWith('/'))
      .map((href) => href.replace(/\/$/, '').replace(/^\.\//, ''))
      .filter((name) => name && !name.startsWith('.'));
    // De-duplicate
    return Array.from(new Set(names));
  } catch (_) {
    return [];
  }
}

export async function discoverDatasets() {
  // Try to fetch a directory index for /data
  let candidates = [];
  try {
    const res = await fetch('data/', { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      const text = await res.text();
      if (ct.includes('text/html') || /<html[\s>]/i.test(text)) {
        const names = await parseDirectoryIndex(text);
        candidates = names.map((id) => ({ id, name: id, path: `data/${id}` }));
      }
    }
  } catch (_) { /* ignore */ }

  // Validate by probing for conversations.json
  const fmt = (iso) => {
    if (!iso) return 'Unknown';
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch { return 'Unknown'; }
  };
  const validated = [];
  for (const c of candidates) {
    const res = await probeConversations(c.path);
    if (res.ok) {
      validated.push({ ...c, modifiedAt: res.modifiedAt, timeLabel: fmt(res.modifiedAt) });
    }
  }
  validated.sort((a, b) => a.id.localeCompare(b.id));
  return validated;
}

export async function fetchConversationsJson(path) {
  const url = `${path}/conversations.json`;
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return res.json();
}

export const __test__ = { probeConversations, parseDirectoryIndex };
