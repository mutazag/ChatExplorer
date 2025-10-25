import { renderMarkdownToSafeHtml } from '../utils/markdown.js';
import { classifyMediaByExtOrMime, isSafeSrc } from '../utils/media.js';

export function renderDetail(host, conversation) {
  host.innerHTML = '';
  if (!conversation) {
    const empty = document.createElement('p');
    empty.textContent = 'No conversation selected.';
    host.appendChild(empty);
    return;
  }
  if (!Array.isArray(conversation.messages)) {
    const empty = document.createElement('p');
    empty.textContent = 'This conversation has no messages.';
    host.appendChild(empty);
    return;
  }
  const msgs = [...conversation.messages].sort((a, b) => (a.create_time ?? 0) - (b.create_time ?? 0));
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-detail', '');
  for (const m of msgs) {
    const row = document.createElement('div');
    row.setAttribute('data-msg', '');
    row.className = 'msg';
    const role = document.createElement('strong');
    role.textContent = (m.role || 'unknown') + ': ';
    const text = document.createElement('div');
    const safeHtml = renderMarkdownToSafeHtml(m.text || '');
    text.innerHTML = safeHtml;
    row.appendChild(role);
    row.appendChild(text);
    // Render media items, if any
    if (Array.isArray(m.media) && m.media.length) {
      const mediaEl = renderMediaItems(m.media);
      if (mediaEl) row.appendChild(mediaEl);
    }
    wrapper.appendChild(row);
  }
  host.appendChild(wrapper);
}

function renderMediaItems(mediaList) {
  const container = document.createElement('div');
  container.className = 'msg-media';
  let added = 0;
  for (const item of mediaList) {
    if (!item || !item.src) continue;
    const kind = item.kind || classifyMediaByExtOrMime(item.src, item.mime);
    // TODO: item.src need to be resolved to correct local path 
    const src = item.src;
    const safe = isSafeSrc(src);
    const fallback = (message) => {
      const a = document.createElement('a');
      a.className = 'media-fallback';
      a.textContent = 'Download media';
      if (safe) a.href = src;
      a.target = '_blank';
      a.rel = 'noopener noreferrer nofollow';
      if (message) {
        const span = document.createElement('span');
        span.textContent = message + ' ';
        const frag = document.createDocumentFragment();
        frag.appendChild(span);
        frag.appendChild(a);
        const wrapper = document.createElement('div');
        wrapper.appendChild(frag);
        return wrapper;
      }
      return a;
    };
    if (kind === 'image') {
      if (safe) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = item.alt || deriveAltFromPath(src) || 'Image';
        img.src = src;
        img.onerror = () => {
          const node = fallback('Media failed to load.');
          img.replaceWith(node);
        };
        container.appendChild(img);
        added++;
      } else {
        container.appendChild(fallback('Media failed to load.'));
        added++;
      }
    } else if (kind === 'audio') {
      if (safe) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.setAttribute('aria-label', (item.alt || 'Audio') + (item.role ? ` from ${item.role}` : ''));
        const source = document.createElement('source');
        source.src = src;
        if (item.mime) source.type = item.mime;
        audio.appendChild(source);
        container.appendChild(audio);
        added++;
      } else {
        container.appendChild(fallback('Media failed to load.'));
        added++;
      }
    } else if (kind === 'video') {
      if (safe) {
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.setAttribute('aria-label', (item.alt || 'Video') + (item.role ? ` from ${item.role}` : ''));
        const source = document.createElement('source');
        source.src = src;
        if (item.mime) source.type = item.mime;
        video.appendChild(source);
        container.appendChild(video);
        added++;
      } else {
        container.appendChild(fallback('Media failed to load.'));
        added++;
      }
    } else {
      // Unknown type: provide a safe download link
      container.appendChild(fallback());
      added++;
    }
  }
  return added ? container : null;
}

function deriveAltFromPath(p) {
  try {
    const clean = String(p || '').split('?')[0].split('#')[0];
    const parts = clean.split('/');
    const file = parts[parts.length - 1] || '';
    return file.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim();
  } catch {
    return '';
  }
}
