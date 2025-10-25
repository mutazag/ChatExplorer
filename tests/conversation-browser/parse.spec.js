import { test, assert } from '../lib/harness.js';
import { normalizeConversations, normalizeConversationsWithWarnings } from '../../src/data/conversations/parse.js';

test('normalizeConversations: uses conversation_id and title fallback', () => {
  const mapping = {};
  const rootId = 'n1';
  mapping[rootId] = { id: rootId, parent: null, children: ['n2'], message: { author: { role: 'user' }, create_time: 1000, content: { content_type: 'text', parts: ['Hello'] }, metadata: {} } };
  mapping['n2'] = { id: 'n2', parent: rootId, children: [], message: { author: { role: 'assistant' }, create_time: 2000, content: { content_type: 'text', parts: ['Hi'] }, metadata: {} } };
  const input = [
    { conversation_id: 'c-123', title: null, create_time: 1000, update_time: 2000, mapping, current_node: 'n2' },
    { title: 'no id', create_time: 1100 }, // invalid: no conversation_id
  ];
  const out = normalizeConversations(input);
  assert(Array.isArray(out), 'output should be array');
  assert(out.length === 1, 'should include only conversations with conversation_id');
  const c = out[0];
  assert(c.id === 'c-123', 'id comes from conversation_id');
  assert(c.title === 'c-123', 'title falls back to conversation_id');
  assert(Array.isArray(c.messages) && c.messages.length === 2, 'active path reconstructed');
  assert(c.messages[0].text === 'Hello', 'older message first');
  assert(c.messages[1].role === 'assistant', 'role preserved');
});

test('normalizeConversations: omits visually hidden system scaffolding', () => {
  const mapping = {};
  const r = 'r';
  const s = 's';
  const u = 'u';
  mapping[r] = { id: r, parent: null, children: [s], message: null };
  mapping[s] = { id: s, parent: r, children: [u], message: { author: { role: 'system' }, create_time: 900, content: { content_type: 'text', parts: [''] }, metadata: { is_visually_hidden_from_conversation: true } } };
  mapping[u] = { id: u, parent: s, children: [], message: { author: { role: 'user' }, create_time: 1000, content: { content_type: 'text', parts: ['Q'] }, metadata: {} } };
  const input = [ { conversation_id: 'c-1', title: 'T', create_time: 900, update_time: 1000, mapping, current_node: u } ];
  const out = normalizeConversations(input);
  const msgs = out[0].messages;
  assert(msgs.length === 1, 'hidden system message omitted');
  assert(msgs[0].role === 'user' && msgs[0].text === 'Q', 'kept user message');
});

test('pointer resolution: sediment underscore variant resolves by prefix', () => {
  const files = [
    { name: 'file_ABC123-audio.wav', webkitRelativePath: 'data/extract1/file_ABC123-audio.wav' },
  ];
  const mapping = {};
  const r = 'r1';
  const u = 'u1';
  mapping[r] = { id: r, parent: null, children: [u], message: null };
  mapping[u] = { id: u, parent: r, children: [], message: { author: { role: 'user' }, create_time: 1000, content: {
    content_type: 'multimodal_text', parts: [ { content_type: 'audio_asset_pointer', asset_pointer: 'sediment://file_ABC123' } ] }, metadata: {} } };
  const input = [ { conversation_id: 'conv-1', title: 'T', create_time: 1000, update_time: 1000, mapping, current_node: u } ];
  const { normalized } = normalizeConversationsWithWarnings(input, files);
  const media = normalized[0].messages[0].media;
  assert(media && media[0] && /file_ABC123-audio\.wav$/.test(media[0].src), 'resolved wav path by prefix');
});

test('pointer resolution: generated image under user-* folder resolves', () => {
  const files = [
    { name: 'file-IMGID-something.jpg', webkitRelativePath: 'data/extract1/user-6RjVyY/file-IMGID-something.jpg' },
  ];
  const mapping = {};
  const r = 'r2';
  const a = 'a2';
  mapping[r] = { id: r, parent: null, children: [a], message: null };
  mapping[a] = { id: a, parent: r, children: [], message: { author: { role: 'assistant' }, create_time: 1000, content: {
    content_type: 'multimodal_text', parts: [ { content_type: 'image_asset_pointer', asset_pointer: 'file-service://file-IMGID' } ] }, metadata: {} } };
  const input = [ { conversation_id: 'conv-2', title: 'T', create_time: 1000, update_time: 1000, mapping, current_node: a } ];
  const { normalized } = normalizeConversationsWithWarnings(input, files);
  const media = normalized[0].messages[0].media;
  assert(media && media[0] && /user-.*file-IMGID-something\.jpg$/.test(media[0].src), 'resolved generated image in user-*');
});

test('pointer resolution: conversation-scoped audio/video folders for composite parts', () => {
  const files = [
    { name: 'file_0001.wav', webkitRelativePath: 'data/extract1/conv-xyz/audio/file_0001.wav' },
    { name: 'file_0002.mp4', webkitRelativePath: 'data/extract1/conv-xyz/video/file_0002.mp4' },
  ];
  const mapping = {};
  const r = 'r3';
  const u = 'u3';
  mapping[r] = { id: r, parent: null, children: [u], message: null };
  mapping[u] = { id: u, parent: r, children: [], message: { author: { role: 'user' }, create_time: 1000, content: {
    content_type: 'multimodal_text', parts: [ {
      content_type: 'real_time_user_audio_video_asset_pointer',
      video_container_asset_pointer: { content_type: 'video_container_asset_pointer', asset_pointer: 'sediment://file_0002' },
      audio_asset_pointer: { content_type: 'audio_asset_pointer', asset_pointer: 'sediment://file_0001' },
    } ] }, metadata: {} } };
  const input = [ { conversation_id: 'conv-xyz', title: 'T', create_time: 1000, update_time: 1000, mapping, current_node: u } ];
  const { normalized } = normalizeConversationsWithWarnings(input, files);
  const media = normalized[0].messages[0].media;
  const hasAudio = media.some((m) => m.kind === 'audio' && /audio\/file_0001\.wav$/.test(m.src));
  const hasVideo = media.some((m) => m.kind === 'video' && /video\/file_0002\.mp4$/.test(m.src));
  assert(hasAudio && hasVideo, 'resolved both audio and video under conversation folders');
});

test('pointer resolution: deterministic selection prefers shortest basename then lexicographic', () => {
  const files = [
    { name: 'file-ABC123-aaa.jpg', webkitRelativePath: 'data/extract1/some/folder/file-ABC123-aaa.jpg' },
    { name: 'file-ABC123.jpg', webkitRelativePath: 'data/extract1/another/file-ABC123.jpg' },
    { name: 'file-ABC123-bbb.jpg', webkitRelativePath: 'data/extract1/zzz/file-ABC123-bbb.jpg' },
  ];
  const mapping = {};
  const r = 'r4';
  const a = 'a4';
  mapping[r] = { id: r, parent: null, children: [a], message: null };
  mapping[a] = { id: a, parent: r, children: [], message: { author: { role: 'assistant' }, create_time: 1000, content: {
    content_type: 'multimodal_text', parts: [ { content_type: 'image_asset_pointer', asset_pointer: 'file-service://file-ABC123' } ] }, metadata: {} } };
  const input = [ { conversation_id: 'conv-4', title: 'T', create_time: 1000, update_time: 1000, mapping, current_node: a } ];
  const { normalized } = normalizeConversationsWithWarnings(input, files);
  const media = normalized[0].messages[0].media;
  assert(media && media[0], 'media item exists');
  // Shortest basename is 'file-ABC123.jpg'; ensure it is chosen.
  assert(/another\/file-ABC123\.jpg$/.test(media[0].src) || /another\/file-ABC123\.jpg$/.test(media[0].src.replace(/\\/g, '/')) || /another\/file-ABC123\.jpg$/.test(media[0].src.replace(/\//g, '/')),
    'chose the shortest basename deterministically');
});
