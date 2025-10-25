import { test, assert } from '../lib/harness.js';
import { renderList } from '../../src/ui/listView.js';
import { renderDetail } from '../../src/ui/detailView.js';
import { normalizeConversationsWithWarnings } from '../../src/data/conversations/parse.js';

test('integration: paging moves through 60 items by 25s', () => {
  const data = Array.from({ length: 60 }, (_, i) => ({ id: String(i+1), title: 'T'+(i+1), create_time: i }));
  const host = document.createElement('div');
  let page = 1;
  renderList(host, data, { page, pageSize: 25, selectedId: null }, { onSelect: () => {}, onPage: (p) => { page = p; } });
  const next = host.querySelector('[data-pager-next]');
  next.click();
  assert(page === 2, 'moved to page 2');
  // re-render page 2
  renderList(host, data, { page, pageSize: 25, selectedId: null }, { onSelect: () => {}, onPage: (p) => { page = p; } });
  const items2 = host.querySelectorAll('[data-item]');
  assert(items2.length === 25, 'page 2 has 25');
  next.click(); // to page 3
  assert(page === 3, 'moved to page 3');
  renderList(host, data, { page, pageSize: 25, selectedId: null }, { onSelect: () => {}, onPage: (p) => { page = p; } });
  const items3 = host.querySelectorAll('[data-item]');
  assert(items3.length === 10, 'page 3 has 10');
});

test('integration: image load error shows fallback message', () => {
  const host = document.createElement('div');
  const convo = {
    id: 'c-img-err',
    messages: [
      { role: 'assistant', create_time: 1000, text: 'broken image', media: [ { kind: 'image', src: '/does-not-exist.png', alt: 'missing' } ] }
    ]
  };
  renderDetail(host, convo);
  const img = host.querySelector('.msg-media img');
  assert(img, 'image element initially present');
  // Simulate onerror
  const evt = new Event('error');
  img.dispatchEvent(evt);
  const fallback = host.querySelector('.msg-media .media-fallback');
  assert(fallback, 'fallback link rendered after error');
  const text = host.querySelector('.msg-media');
  assert(/Media failed to load\./.test(text.textContent), 'fallback message visible');
});

test('integration: unsupported media renders download link', () => {
  const host = document.createElement('div');
  const convo = {
    id: 'c-unsupported',
    messages: [
      { role: 'assistant', create_time: 1000, text: 'file', media: [ { kind: 'file', src: '/some/file.bin' } ] }
    ]
  };
  renderDetail(host, convo);
  const link = host.querySelector('.msg-media .media-fallback');
  assert(link && /Download media/.test(link.textContent), 'download link shown for unknown type');
});

test('integration: image pointer resolves to existing sample file', () => {
  // Use an existing image under data/extract1
  const files = [
    { name: 'file-HiumaRZufjkyY9hYpZJ3VN-Screenshot_20250704_212012_Duolingo.jpg', webkitRelativePath: 'data/extract1/file-HiumaRZufjkyY9hYpZJ3VN-Screenshot_20250704_212012_Duolingo.jpg' },
  ];
  const mapping = {};
  const r = 'ri1';
  const a = 'ai1';
  mapping[r] = { id: r, parent: null, children: [a], message: null };
  mapping[a] = { id: a, parent: r, children: [], message: { author: { role: 'assistant' }, create_time: 1000, content: {
    content_type: 'multimodal_text', parts: [ { content_type: 'image_asset_pointer', asset_pointer: 'file-service://file-HiumaRZufjkyY9hYpZJ3VN' } ] }, metadata: {} } };
  const input = [ { conversation_id: 'conv-img', title: 'T', create_time: 1000, update_time: 1000, mapping, current_node: a } ];
  const { normalized } = normalizeConversationsWithWarnings(input, files);
  const media = normalized[0].messages[0].media;
  assert(media && media[0] && /data\/extract1\/file-HiumaRZufjkyY9hYpZJ3VN-/.test(media[0].src), 'resolved path under data/extract1');
});

test('integration: composite audio+video resolve under conversation folders', () => {
  const files = [
    { name: 'file_00000000e74861f6885e674ae697806c-3047f4ed-ba71-4991-b1ff-8fab2955bbcc.mp4', webkitRelativePath: 'data/extract1/68666697-1db0-800f-9d6b-67f24546abc2/video/file_00000000e74861f6885e674ae697806c-3047f4ed-ba71-4991-b1ff-8fab2955bbcc.mp4' },
    { name: 'file_00000000710c61f68421287a6105fe07-fca1cc80-74cc-429f-a3a1-6278e543df60.wav', webkitRelativePath: 'data/extract1/68666697-1db0-800f-9d6b-67f24546abc2/audio/file_00000000710c61f68421287a6105fe07-fca1cc80-74cc-429f-a3a1-6278e543df60.wav' },
  ];
  const mapping = {};
  const r = 'ri2';
  const u = 'ui2';
  mapping[r] = { id: r, parent: null, children: [u], message: null };
  mapping[u] = { id: u, parent: r, children: [], message: { author: { role: 'user' }, create_time: 1000, content: {
    content_type: 'multimodal_text', parts: [ {
      content_type: 'real_time_user_audio_video_asset_pointer',
      video_container_asset_pointer: { content_type: 'video_container_asset_pointer', asset_pointer: 'sediment://file_00000000e74861f6885e674ae697806c' },
      audio_asset_pointer: { content_type: 'audio_asset_pointer', asset_pointer: 'sediment://file_00000000710c61f68421287a6105fe07' },
    } ] }, metadata: {} } };
  const input = [ { conversation_id: '68666697-1db0-800f-9d6b-67f24546abc2', title: 'T', create_time: 1000, update_time: 1000, mapping, current_node: u } ];
  const { normalized } = normalizeConversationsWithWarnings(input, files);
  const media = normalized[0].messages[0].media;
  const hasAudio = media.some((m) => m.kind === 'audio' && /audio\/file_00000000710c61f68421287a6105fe07-/.test(m.src));
  const hasVideo = media.some((m) => m.kind === 'video' && /video\/file_00000000e74861f6885e674ae697806c-/.test(m.src));
  assert(hasAudio && hasVideo, 'resolved composite audio and video under conv folders');
});
