export function normalizeConversations(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const c of input) {
    if (!c || !c.id) continue;
    out.push({
      id: String(c.id),
      title: c.title ?? '',
      create_time: toNumberOrNull(c.create_time),
      update_time: toNumberOrNull(c.update_time),
      messages: Array.isArray(c.mapping)
        ? c.mapping
        : Array.isArray(c.messages)
        ? c.messages
        : [],
    });
  }
  return out;
}

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeConversationsWithWarnings(input) {
  const total = Array.isArray(input) ? input.length : 0;
  const normalized = normalizeConversations(input);
  const loaded = normalized.length;
  const skipped = Math.max(0, total - loaded);
  return { normalized, stats: { total, loaded, skipped } };
}
