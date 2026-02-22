// Minimal ImageLightbox implementation (MVP)
import { setAriaLabel, trapFocus, restoreFocus } from '../utils/a11y.js';
import { resolveImageSrc } from '../utils/mediaResolver.js';
import { create as createLightboxState } from '../modules/imageLightboxState.js';
import { create as createPanZoom } from '../modules/imagePanZoom.js';

const OVERLAY_CLASS = 'image-lightbox';
const IMG_CLASS = 'image-lightbox__img';
const VIDEO_WRAP_CLASS = 'image-lightbox__videoWrap';
const VIDEO_CLASS = 'image-lightbox__video';
const AUDIO_WRAP_CLASS = 'image-lightbox__audioWrap';
const AUDIO_CLASS = 'image-lightbox__audio';

function createOverlayFor(kind, src, origin) {
  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog');
  const ariaLabel = kind === 'video' ? 'Video preview' : (kind === 'audio' ? 'Audio preview' : 'Image preview');
  setAriaLabel(overlay, ariaLabel);

  let controls = null;
  if (kind === 'image') {
    const img = document.createElement('img');
    img.className = IMG_CLASS;
    let resolvedSrc = '';
    try {
      resolvedSrc = resolveImageSrc(src);
    } catch (e) {
      // intentionally silent: invalid image URL — overlay shows broken image icon
    }
    img.src = resolvedSrc || '';
    img.alt = origin && origin.alt ? origin.alt : 'Image preview';
    overlay.appendChild(img);

    // Zoom controls
    controls = document.createElement('div');
    controls.className = 'image-lightbox__controls';
    controls.innerHTML = '<button data-zoom="in" aria-label="Zoom in">+</button><button data-zoom="out" aria-label="Zoom out">−</button><button data-zoom="reset" aria-label="Reset zoom">⟳</button>';
    overlay.appendChild(controls);
  } else if (kind === 'video') {
    const wrap = document.createElement('div');
    wrap.className = VIDEO_WRAP_CLASS;
    const video = document.createElement('video');
    video.className = VIDEO_CLASS;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    try {
      const url = resolveImageSrc(src);
      if (url) {
        const source = document.createElement('source');
        source.src = url;
        video.appendChild(source);
      }
    } catch (e) {
      // intentionally silent: invalid media URL — overlay shows empty player
    }
    wrap.appendChild(video);
    overlay.appendChild(wrap);
    overlay._mediaEl = video;
  } else if (kind === 'audio') {
    const wrap = document.createElement('div');
    wrap.className = AUDIO_WRAP_CLASS;
    const audio = document.createElement('audio');
    audio.className = AUDIO_CLASS;
    audio.controls = true;
    audio.preload = 'metadata';
    try {
      const url = resolveImageSrc(src);
      if (url) {
        const source = document.createElement('source');
        source.src = url;
        audio.appendChild(source);
      }
    } catch (e) {
      // intentionally silent: invalid media URL — overlay shows empty player
    }
    wrap.appendChild(audio);
    overlay.appendChild(wrap);
    overlay._mediaEl = audio;
  }

  // Close when clicking overlay background (not the media element)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay(overlay, origin);
  });

  // ESC to close; +/−/0 for zoom (image only)
  function onKey(e) {
    if (e.key === 'Escape') closeOverlay(overlay, origin);
    if (kind === 'image' && e.key === '+') {
      if (overlay._panZoom) overlay._panZoom.setScale(overlay._panZoom.scale + 0.1);
    }
    if (kind === 'image' && e.key === '-') {
      if (overlay._panZoom) overlay._panZoom.setScale(overlay._panZoom.scale - 0.1);
    }
    if (kind === 'image' && e.key === '0') {
      if (overlay._panZoom) overlay._panZoom.reset();
    }
  }
  document.addEventListener('keydown', onKey);
  overlay._cleanup = () => { document.removeEventListener('keydown', onKey); };

  // Wire zoom controls (image only)
  if (kind === 'image' && controls) {
    controls.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const act = btn.dataset.zoom;
      if (!overlay._panZoom) return;
      if (act === 'in') overlay._panZoom.setScale(overlay._panZoom.scale + 0.2);
      if (act === 'out') overlay._panZoom.setScale(overlay._panZoom.scale - 0.2);
      if (act === 'reset') overlay._panZoom.reset();
    });
  }

  // Trap focus within overlay
  const cleanupTrap = trapFocus(overlay);
  const prevCleanup = overlay._cleanup;
  overlay._cleanup = () => {
    try { cleanupTrap && cleanupTrap(); } catch (e) {}
    prevCleanup && prevCleanup();
  };

  return overlay;
}

function openOverlay(kind, src, origin) {
  // Avoid opening multiple overlays
  if (document.querySelector('.' + OVERLAY_CLASS)) return;
  const overlay = createOverlayFor(kind, src, origin);
  document.body.appendChild(overlay);

  // Focus media for video/audio so Space/Enter work with native controls; overlay for image
  if ((kind === 'video' || kind === 'audio') && overlay._mediaEl && typeof overlay._mediaEl.focus === 'function') {
    overlay._mediaEl.focus();
  } else {
    overlay.focus();
  }
  overlay._origin = origin || document.activeElement;

  overlay._state = createLightboxState();
  overlay._state.open(overlay._origin);

  // Ensure origin element is focusable for focus restoration
  function isNaturallyFocusable(el) {
    if (!el) return false;
    const focusableSelectors = 'a,button,input,textarea,select,details,[tabindex]';
    if (el.matches && el.matches(focusableSelectors)) return true;
    return typeof el.tabIndex === 'number' && el.tabIndex >= 0;
  }
  if (overlay._origin && !isNaturallyFocusable(overlay._origin)) {
    try {
      overlay._origin.setAttribute('tabindex', '0');
      overlay._originTempTabindex = true;
    } catch (e) {}
  }
  overlay._originFocusTarget = overlay._origin;

  // Attach pan/zoom for images only
  if (kind === 'image') {
    try {
      const imgEl = overlay.querySelector('.' + IMG_CLASS);
      if (imgEl) {
        const pz = createPanZoom(imgEl);
        pz.attach && pz.attach();
        overlay._panZoom = pz;
        if (overlay._state && overlay._state.syncFromPanZoom) {
          overlay._state.syncFromPanZoom(pz);
        }
        const prevCleanup = overlay._cleanup;
        overlay._cleanup = () => {
          try { pz.detach && pz.detach(); } catch (e) {}
          prevCleanup && prevCleanup();
        };
      }
    } catch (e) {
      // intentionally silent: pan/zoom is an enhancement, not critical
    }
  }

  // Wheel zoom on overlay background (image only)
  function overlayWheel(e) {
    try {
      if (overlay._panZoom) {
        overlay._panZoom.setScale(overlay._panZoom.scale + (e.deltaY > 0 ? -0.1 : 0.1), e.clientX, e.clientY);
        if (overlay._state && overlay._state.setScale) {
          overlay._state.setScale(overlay._panZoom.scale);
        }
        e.preventDefault();
      }
    } catch (err) {
      // intentionally silent: wheel zoom is an enhancement
    }
  }
  if (kind === 'image') overlay.addEventListener('wheel', overlayWheel, { passive: false });
  const prevCleanup2 = overlay._cleanup;
  overlay._cleanup = () => {
    if (kind === 'image') overlay.removeEventListener('wheel', overlayWheel);
    prevCleanup2 && prevCleanup2();
  };
}

function closeOverlay(overlay, origin) {
  if (!overlay) return;
  if (overlay._cleanup) overlay._cleanup();
  overlay.remove();
  try {
    const target = origin || overlay._originFocusTarget || overlay._origin || document.body;
    if (overlay._state && overlay._state.close) { try { overlay._state.close(); } catch (e) {} }
    const needTemp = !overlay._originTempTabindex;
    restoreFocus(target, { tempTabIndex: needTemp });
  } catch (e) {
    // intentionally silent: focus restoration is best-effort
  }
}

// Public API — named exports for ES module consumers
export function open(src, origin) { openOverlay('image', src, origin); }
export function openMedia(payload, origin) {
  const kind = (payload && payload.kind) || 'image';
  const src = payload && payload.src;
  openOverlay(kind, src, origin);
}
export function close() {
  const overlay = document.querySelector('.' + OVERLAY_CLASS);
  if (overlay) closeOverlay(overlay, overlay._origin);
}

// Keep window.imageLightbox for backward compat while mediaRenderer.js still uses it
window.imageLightbox = { open, openMedia, close };

// Auto-bind to elements with data-lightbox attribute (click)
document.addEventListener('click', (e) => {
  const el = e.target;
  if (!el) return;
  const wantsLB = el.dataset.lightbox !== undefined || el.hasAttribute('data-lightbox');
  if (!wantsLB) return;
  const tag = el.tagName;
  if (tag === 'IMG') {
    e.preventDefault();
    open(el.src, el);
  } else if (tag === 'VIDEO') {
    e.preventDefault();
    const src = el.currentSrc || (el.querySelector('source')?.src) || el.src;
    openMedia({ kind: 'video', src }, el);
  } else if (tag === 'AUDIO') {
    e.preventDefault();
    const src = el.currentSrc || (el.querySelector('source')?.src) || el.src;
    openMedia({ kind: 'audio', src }, el);
  }
});

// Capture-phase pointerdown to reliably open lightbox before native media controls handle the event
function getLightboxTargetFromEvent(e) {
  try {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : null;
    const check = (node) => node && node.nodeType === 1 && (node.matches('img[data-lightbox], video[data-lightbox], audio[data-lightbox]')) ? node : null;
    if (Array.isArray(path)) {
      for (const node of path) {
        const m = check(node);
        if (m) return m;
      }
    }
    const t = e.target && e.target.closest && e.target.closest('img[data-lightbox], video[data-lightbox], audio[data-lightbox]');
    return t || null;
  } catch { return null; }
}
document.addEventListener('pointerdown', (e) => {
  const target = getLightboxTargetFromEvent(e);
  if (!target) return;
  e.preventDefault();
  e.stopPropagation();
  if (target.tagName === 'IMG') {
    open(target.src, target);
  } else if (target.tagName === 'VIDEO') {
    const src = target.currentSrc || (target.querySelector('source')?.src) || target.src;
    openMedia({ kind: 'video', src }, target);
  } else if (target.tagName === 'AUDIO') {
    const src = target.currentSrc || (target.querySelector('source')?.src) || target.src;
    openMedia({ kind: 'audio', src }, target);
  }
}, true);

// Keyboard activation for media with data-lightbox (Enter/Space)
document.addEventListener('keydown', (e) => {
  const el = e.target;
  if (!el) return;
  const isActivateKey = (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar');
  if (!isActivateKey) return;
  if (!(el.dataset && (el.dataset.lightbox !== undefined || el.hasAttribute && el.hasAttribute('data-lightbox')))) return;
  const tag = el.tagName;
  if (tag === 'IMG') {
    e.preventDefault();
    open(el.src, el);
  } else if (tag === 'VIDEO') {
    e.preventDefault();
    const src = el.currentSrc || (el.querySelector('source')?.src) || el.src;
    openMedia({ kind: 'video', src }, el);
  } else if (tag === 'AUDIO') {
    e.preventDefault();
    const src = el.currentSrc || (el.querySelector('source')?.src) || el.src;
    openMedia({ kind: 'audio', src }, el);
  }
});
