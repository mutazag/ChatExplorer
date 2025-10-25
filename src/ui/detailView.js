import { renderMarkdownToSafeHtml } from '../utils/markdown.js';
import { classifyMediaByExtOrMime, isSafeSrc } from '../utils/media.js';
import { getState } from '../state/appState.js';
import { setHashForId } from '../router/hash.js';

export function renderDetail(host, conversation) {
  host.innerHTML = '';
  // Mobile: dropdown conversation selector (visible via CSS at small widths)
  const mobilePicker = renderMobileConversationPicker();
  if (mobilePicker) host.appendChild(mobilePicker);
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
    const roleName = (m.role || 'unknown');
    row.className = 'msg ' + (roleName === 'user' ? 'msg--user' : 'msg--assistant');

    // Header: icon + role label
    const header = document.createElement('div');
    header.className = 'msg-header';
    const icon = document.createElement('img');
    if (roleName === 'user') {
      icon.src = 'assets/user-human.svg';
      icon.alt = 'User';
    } else {
      icon.src = 'assets/assistant-robot.svg';
      icon.alt = 'Assistant';
    }
    const label = document.createElement('span');
    label.textContent = roleName + ':';
    header.appendChild(icon);
    header.appendChild(label);

    // Bubble: sanitized markdown
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    // Auto-detect text direction based on first strong character
    bubble.setAttribute('dir', 'auto');
    const safeHtml = renderMarkdownToSafeHtml(m.text || '');
    bubble.innerHTML = safeHtml;

    row.appendChild(header);
    row.appendChild(bubble);
    // Render media items, if any
    if (Array.isArray(m.media) && m.media.length) {
      const mediaEl = renderMediaItems(m.media);
      if (mediaEl) row.appendChild(mediaEl);
    }
    // Timestamp (hidden by default; reveal via hover/focus/tap)
    if (m.create_time) {
      const ts = document.createElement('div');
      ts.className = 'timestamp';
      try {
        const d = new Date(m.create_time * 1000 || m.create_time);
        ts.textContent = d.toLocaleString();
      } catch {
        ts.textContent = String(m.create_time);
      }
      row.appendChild(ts);
      // Touch/click support to toggle visibility
      row.addEventListener('click', () => {
        row.classList.toggle('is-tapped');
      });
    }
    wrapper.appendChild(row);
  }
  host.appendChild(wrapper);
}

function renderMobileConversationPicker() {
  try {
    const state = getState();
    const list = Array.isArray(state.conversations) ? state.conversations : [];
    if (!list.length) return null;
    const box = document.createElement('div');
    box.className = 'mobile-list';
    box.setAttribute('data-mobile-list', '');
    const label = document.createElement('label');
    label.textContent = 'Conversation:';
    label.htmlFor = 'mobile-conv-select';
    const sel = document.createElement('select');
    sel.id = 'mobile-conv-select';
    sel.setAttribute('aria-label', 'Select conversation');
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const opt = document.createElement('option');
      opt.value = String(c.id);
      const title = c.title || `Conversation ${i + 1}`;
      opt.textContent = title;
      if (String(c.id) === String(state.selectedId)) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
      const id = sel.value;
      // Update hash so app.js hash listener sets selection and redraws
      setHashForId(id);
    });
    box.appendChild(label);
    box.appendChild(sel);
    return box;
  } catch {
    return null;
  }
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

// Simple RTL detector based on presence of strong RTL characters
function isProbablyRtl(text) {
  try {
    const s = String(text || '');
    // Arabic, Hebrew, Syriac, Arabic Presentation Forms, etc.
    const rtlRe = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlRe.test(s);
  } catch {
    return false;
  }
}
