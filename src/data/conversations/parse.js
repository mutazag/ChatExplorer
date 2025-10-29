import { buildAssetIndex, parseAssetPointer } from '../../utils/assetIndex.js';

export function normalizeConversations(input, filesForIndex) {
  if (!Array.isArray(input)) return [];
  const assetIndex = filesForIndex ? buildAssetIndex(filesForIndex) : null;
  const out = [];
  for (const c of input) {
    if (!c || !c.conversation_id) continue;
    const id = String(c.conversation_id);
    const create_time = toNumberOrNull(c.create_time);
    const update_time = toNumberOrNull(c.update_time);
    const pathMessages = reconstructActivePathMessages(c, assetIndex);
    const title = normalizeTitle(c, id, pathMessages);
    out.push({ id, title, create_time, update_time, messages: pathMessages });
  }
  return out;
}

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeConversationsWithWarnings(input, filesForIndex) {
  const total = Array.isArray(input) ? input.length : 0;
  const normalized = normalizeConversations(input, filesForIndex);
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

function reconstructActivePathMessages(c, assetIndex) {
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
    // Hide messages explicitly marked as visually hidden regardless of role
    const hidden = m.metadata && m.metadata.is_visually_hidden_from_conversation === true;
    if (hidden) continue;
    const { text, hasImage, media } = toRenderableContent(m.content, assetIndex, String(c.conversation_id));
    // Skip rendering if there is no textual content and no media to show
    const hasText = !!(text && String(text).trim());
    const hasMedia = Array.isArray(media) && media.length > 0;
    if (!hasText && !hasMedia) continue;
    // Build deterministic meta mapping for tooltips (US6)
    const nodeId = String(n && n.id ? n.id : (m.id || ''));
    const parentId = n && n.parent ? String(n.parent) : (m && m.metadata && m.metadata.parent_id ? String(m.metadata.parent_id) : undefined);
    const contentType = m && m.content && m.content.content_type ? String(m.content.content_type) : '';
    const createdTime = toNumberOrNull(m.create_time);
    const modelSlug = (role === 'assistant' && m && m.metadata) ? (m.metadata.model_slug || m.metadata.default_model_slug || null) : null;
    // Optional extras surfaced if present
    let status = null;
    if (m && m.status != null && m.status !== '') {
      status = String(m.status);
    } else if (m && m.metadata && m.metadata.status != null && m.metadata.status !== '') {
      status = String(m.metadata.status);
    }
    const selected_sources = m && m.metadata && Array.isArray(m.metadata.selected_sources) ? m.metadata.selected_sources.slice(0) : null;
    const prompt_expansion_predictions = m && m.metadata && Array.isArray(m.metadata.prompt_expansion_predictions) ? m.metadata.prompt_expansion_predictions.slice(0) : null;
    const safe_urls = m && m.metadata && Array.isArray(m.metadata.safe_urls) ? m.metadata.safe_urls.slice(0) : null;
    const is_user_system_message = m && m.metadata && typeof m.metadata.is_user_system_message === 'boolean' ? m.metadata.is_user_system_message : null;
    const user_context_message_data = m && m.metadata && m.metadata.user_context_message_data && typeof m.metadata.user_context_message_data === 'object' ? { ...m.metadata.user_context_message_data } : null;
    msgs.push({
      id: String(m.id || n.id || ''),
      role: role || 'unknown',
      create_time: createdTime,
      update_time: toNumberOrNull(m.update_time),
      text: text,
      hasImage: hasImage || false,
      media: Array.isArray(media) ? media : [],
      meta: {
        nodeId,
        ...(parentId ? { parentId } : {}),
        contentType,
        createdTime,
        ...(modelSlug ? { modelSlug } : {}),
        ...(status ? { status } : {}),
        ...(selected_sources ? { selected_sources } : {}),
        ...(prompt_expansion_predictions ? { prompt_expansion_predictions } : {}),
        ...(safe_urls ? { safe_urls } : {}),
        ...(typeof is_user_system_message === 'boolean' ? { is_user_system_message } : {}),
        ...(user_context_message_data ? { user_context_message_data } : {}),
      },
    });
  }
  return msgs;
}

function toRenderableContent(content, assetIndex, conversationId) {
  if (!content || !content.content_type) return { text: '', hasImage: false, media: [] };
  if (content.content_type === 'text') {
    const parts = Array.isArray(content.parts) ? content.parts : [];
    return { text: parts.join(' ').trim(), hasImage: false, media: [] };
  }
  if (content.content_type === 'multimodal_text') {
    const parts = Array.isArray(content.parts) ? content.parts : [];
    let text = '';
    let hasImage = false;
    const media = [];
    for (const p of parts) {
      if (typeof p === 'string') {
        text += (text ? ' ' : '') + p;
      } else if (p && typeof p === 'object') {
        // Treat audio transcriptions with text as textual content
        if (p.content_type === 'audio_transcription' && typeof p.text === 'string' && p.text.trim()) {
          text += (text ? ' ' : '') + p.text.trim();
        }
        if (p.content_type === 'image_asset_pointer') {
          const pointer = parseAssetPointer(p.asset_pointer || p.url || '');
          const resolved = resolveFirst(assetIndex, pointer, conversationId, 'image');
          hasImage = true;
          media.push({ kind: 'image', src: resolved || (p.asset_pointer || ''), mime: p.mime_type || null, alt: p.alt || 'Image', pointer });
        } else if (p.content_type === 'audio_asset_pointer' || p.content_type === 'input_audio') {
          const pointer = parseAssetPointer(p.asset_pointer || p.url || '');
          const resolved = resolveFirst(assetIndex, pointer, conversationId, 'audio');
          media.push({ kind: 'audio', src: resolved || (p.asset_pointer || ''), mime: p.mime_type || (p.format ? `audio/${p.format}` : null), alt: p.alt || 'Audio', pointer });
        } else if (p.content_type === 'video_container_asset_pointer' || p.content_type === 'video_asset_pointer') {
          const pointer = parseAssetPointer(p.asset_pointer || p.url || '');
          const resolved = resolveFirst(assetIndex, pointer, conversationId, 'video');
          media.push({ kind: 'video', src: resolved || (p.asset_pointer || ''), mime: p.mime_type || null, alt: p.alt || 'Video', pointer });
        } else if (p.content_type === 'real_time_user_audio_video_asset_pointer') {
          // Composite: may include nested video_container_asset_pointer and audio_asset_pointer
          const v = p.video_container_asset_pointer;
          if (v && (v.asset_pointer || v.url)) {
            const pointer = parseAssetPointer(v.asset_pointer || v.url);
            const resolved = resolveFirst(assetIndex, pointer, conversationId, 'video');
            media.push({ kind: 'video', src: resolved || (v.asset_pointer || ''), mime: v.mime_type || (v.format ? `video/${v.format}` : null), alt: 'Video', pointer });
          }
          const a = p.audio_asset_pointer;
          if (a && (a.asset_pointer || a.url)) {
            const pointer = parseAssetPointer(a.asset_pointer || a.url);
            const resolved = resolveFirst(assetIndex, pointer, conversationId, 'audio');
            media.push({ kind: 'audio', src: resolved || (a.asset_pointer || ''), mime: a.mime_type || (a.format ? `audio/${a.format}` : null), alt: 'Audio', pointer });
          }
        } else if (p.content_type === 'audio_transcription' && p.asset_pointer) {
          const pointer = parseAssetPointer(p.asset_pointer);
          const resolved = resolveFirst(assetIndex, pointer, conversationId, 'audio');
          media.push({ kind: 'audio', src: resolved || p.asset_pointer, mime: p.mime_type || null, alt: 'Audio', pointer });
        }
      }
    }
    return { text: text.trim(), hasImage, media };
  }
  return { text: '', hasImage: false, media: [] };
}

function resolveFirst(assetIndex, pointer, conversationId, kindHint) {
  if (!assetIndex || !pointer) return '';
  const results = assetIndex.resolvePointer(pointer, { conversationId, kind: kindHint });
  return results && results[0] ? results[0] : '';
}
