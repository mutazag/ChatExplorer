import { classifyMediaByExtOrMime, isSafeSrc } from '../utils/media.js';

/**
 * Derives a human-readable alt text from a media file path.
 * @param {string} p - File path or URL
 * @returns {string}
 */
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

/**
 * Creates a safe fallback download link for media that cannot be rendered inline.
 * @param {string} src - Media source URL
 * @param {boolean} safe - Whether the src is a safe URL
 * @param {string} [message] - Optional error message to prepend
 * @returns {HTMLElement}
 */
function createFallback(src, safe, message) {
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
}

/**
 * Renders a collection of media items into a container element.
 * @param {Array} mediaList - Array of media objects with src, kind, mime, alt, role
 * @returns {HTMLElement|null} A div.msg-media element, or null if no items rendered
 */
export function renderMediaItems(mediaList) {
  if (!Array.isArray(mediaList) || !mediaList.length) return null;
  const container = document.createElement('div');
  container.className = 'msg-media';
  let added = 0;

  for (const item of mediaList) {
    if (!item || !item.src) continue;
    const kind = item.kind || classifyMediaByExtOrMime(item.src, item.mime);
    const src = item.src;
    const safe = isSafeSrc(src);
    const fallback = (message) => createFallback(src, safe, message);

    if (kind === 'image') {
      if (safe) {
        const wrap = document.createElement('span');
        wrap.className = 'media-with-expand';
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = item.alt || deriveAltFromPath(src) || 'Image';
        img.src = src;
        img.setAttribute('data-lightbox', 'true');
        img.onerror = () => {
          const node = fallback('Media failed to load.');
          wrap.replaceWith(node);
        };
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'media-expand-btn';
        btn.setAttribute('aria-label', 'Expand image');
        btn.textContent = '⤢';
        btn.addEventListener('click', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          try { window.imageLightbox && window.imageLightbox.open(img.src, img); } catch {}
        });
        wrap.appendChild(img);
        wrap.appendChild(btn);
        container.appendChild(wrap);
        added++;
      } else {
        container.appendChild(fallback('Media failed to load.'));
        added++;
      }
    } else if (kind === 'audio') {
      if (safe) {
        const wrap = document.createElement('span');
        wrap.className = 'media-with-expand';
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.setAttribute('aria-label', (item.alt || 'Audio') + (item.role ? ` from ${item.role}` : ''));
        const source = document.createElement('source');
        source.src = src;
        if (item.mime) source.type = item.mime;
        audio.appendChild(source);
        audio.setAttribute('data-lightbox', 'true');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'media-expand-btn';
        btn.setAttribute('aria-label', 'Expand audio');
        btn.textContent = '⤢';
        btn.addEventListener('click', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          try {
            const src2 = audio.currentSrc || (audio.querySelector('source')?.src) || audio.src;
            window.imageLightbox && window.imageLightbox.openMedia({ kind: 'audio', src: src2 }, audio);
          } catch {}
        });
        wrap.appendChild(audio);
        wrap.appendChild(btn);
        container.appendChild(wrap);
        added++;
      } else {
        container.appendChild(fallback('Media failed to load.'));
        added++;
      }
    } else if (kind === 'video') {
      if (safe) {
        const wrap = document.createElement('span');
        wrap.className = 'media-with-expand';
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.setAttribute('aria-label', (item.alt || 'Video') + (item.role ? ` from ${item.role}` : ''));
        const source = document.createElement('source');
        source.src = src;
        if (item.mime) source.type = item.mime;
        video.appendChild(source);
        video.setAttribute('data-lightbox', 'true');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'media-expand-btn';
        btn.setAttribute('aria-label', 'Expand video');
        btn.textContent = '⤢';
        btn.addEventListener('click', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          try {
            const src2 = video.currentSrc || (video.querySelector('source')?.src) || video.src;
            window.imageLightbox && window.imageLightbox.openMedia({ kind: 'video', src: src2 }, video);
          } catch {}
        });
        wrap.appendChild(video);
        wrap.appendChild(btn);
        container.appendChild(wrap);
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
