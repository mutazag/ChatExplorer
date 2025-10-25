export function normalizeConversations(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const c of input) {
    if (!c || !c.conversation_id) continue;
    const id = String(c.conversation_id);
    const create_time = toNumberOrNull(c.create_time);
    const update_time = toNumberOrNull(c.update_time);
    const pathMessages = reconstructActivePathMessages(c);
    const title = normalizeTitle(c, id, pathMessages);
    out.push({ id, title, create_time, update_time, messages: pathMessages });
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

function normalizeTitle(c, id, messages) {
  const raw = (c.title || '').trim();
  if (raw) return raw;
  if (id) return id;
  const first = (messages || []).find((m) => m && m.role !== 'system' && m.text && m.text.trim());
  return first ? first.text.slice(0, 80) : 'Untitled';
}

function reconstructActivePathMessages(c) {
  const mapping = c && c.mapping && typeof c.mapping === 'object' ? c.mapping : null;
  const current = c && c.current_node ? String(c.current_node) : null;
  if (!mapping || !current || !mapping[current]) return [];
  const stack = [];
  let nodeId = current;
  const safety = 10000;
  let guard = 0;
  while (nodeId && mapping[nodeId] && guard++ < safety) {
    stack.push(mapping[nodeId]);
    const parent = mapping[nodeId].parent;
    nodeId = parent ? String(parent) : null;
  }
  const chronological = stack.reverse();
  const msgs = [];
  for (const n of chronological) {
    const m = n && n.message;
    if (!m) continue;
    const role = (m.author && m.author.role) || null;
    const hidden = role === 'system' && m.metadata && m.metadata.is_visually_hidden_from_conversation === true;
    if (hidden) continue;
    const { text, hasImage } = toRenderableContent(m.content);
    msgs.push({
      id: String(m.id || n.id || ''),
      role: role || 'unknown',
      create_time: toNumberOrNull(m.create_time),
      update_time: toNumberOrNull(m.update_time),
      text: text,
      hasImage: hasImage || false,
    });
  }
  return msgs;
}

function toRenderableContent(content) {
  if (!content || !content.content_type) return { text: '', hasImage: false };
  if (content.content_type === 'text') {
    const parts = Array.isArray(content.parts) ? content.parts : [];
    return { text: parts.join(' ').trim(), hasImage: false };
  }
  if (content.content_type === 'multimodal_text') {
    const parts = Array.isArray(content.parts) ? content.parts : [];
    let text = '';
    let hasImage = false;
    for (const p of parts) {
      if (typeof p === 'string') {
        text += (text ? ' ' : '') + p;
      } else if (p && p.content_type === 'image_asset_pointer') {
        hasImage = true;
      }
    }
    return { text: text.trim(), hasImage };
  }
  return { text: '', hasImage: false };
}
