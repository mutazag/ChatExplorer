// Minimal ImageLightbox implementation (MVP)
(function () {
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
    if (window.a11y && window.a11y.setAriaLabel) {
      const label = kind === 'video' ? 'Video preview' : (kind === 'audio' ? 'Audio preview' : 'Image preview');
      window.a11y.setAriaLabel(overlay, label);
    } else {
      overlay.setAttribute('aria-label', kind === 'video' ? 'Video preview' : (kind === 'audio' ? 'Audio preview' : 'Image preview'));
    }
    let controls = null;
    if (kind === 'image') {
      const img = document.createElement('img');
      img.className = IMG_CLASS;
      // Resolve and enforce safe URL schemes
      try {
        if (window.mediaResolver && window.mediaResolver.resolveImageSrc) {
          img.src = window.mediaResolver.resolveImageSrc(src);
        } else {
          img.src = src;
        }
      } catch (e) { img.src = src; }
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
        // For now reuse resolver (allowed schemes) for media
        const url = (window.mediaResolver && window.mediaResolver.resolveImageSrc) ? window.mediaResolver.resolveImageSrc(src) : src;
        if (url) {
          const source = document.createElement('source');
          source.src = url;
          video.appendChild(source);
        }
      } catch (e) {}
      wrap.appendChild(video);
      overlay.appendChild(wrap);
    } else if (kind === 'audio') {
      const wrap = document.createElement('div');
      wrap.className = AUDIO_WRAP_CLASS;
      const audio = document.createElement('audio');
      audio.className = AUDIO_CLASS;
      audio.controls = true;
      audio.preload = 'metadata';
      try {
        const url = (window.mediaResolver && window.mediaResolver.resolveImageSrc) ? window.mediaResolver.resolveImageSrc(src) : src;
        if (url) {
          const source = document.createElement('source');
          source.src = url;
          audio.appendChild(source);
        }
      } catch (e) {}
      wrap.appendChild(audio);
      overlay.appendChild(wrap);
    }

    // Close when clicking overlay (but not when clicking image)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay(overlay, origin);
      }
    });

    // ESC to close and +/- for zoom (image only)
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

    // store cleanup
    overlay._cleanup = () => {
      document.removeEventListener('keydown', onKey);
    };

    // Wire controls (image only)
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
    if (window.a11y && window.a11y.trapFocus) {
      const cleanupTrap = window.a11y.trapFocus(overlay);
      const prevCleanup = overlay._cleanup;
      overlay._cleanup = () => { try { cleanupTrap && cleanupTrap(); } catch (e) {}; prevCleanup && prevCleanup(); };
    }

    return overlay;
  }

  function openOverlay(kind, src, origin) {
    // avoid duplicates
    if (document.querySelector('.' + 'image-lightbox')) return;
    const overlay = createOverlayFor(kind, src, origin);
    document.body.appendChild(overlay);
    overlay.focus();
    // store last focused element to restore
    overlay._origin = origin || document.activeElement;

    // create state and mark open
    if (window.imageLightboxState && typeof window.imageLightboxState.create === 'function') {
      overlay._state = window.imageLightboxState.create();
      overlay._state.open(overlay._origin);
    }
    // Determine a focusable target for restore; if origin isn't focusable, set a temporary tabindex
    function isNaturallyFocusable(el) {
      if (!el) return false;
      const focusableSelectors = 'a,button,input,textarea,select,details,[tabindex]';
      if (el.matches && el.matches(focusableSelectors)) return true;
      // check programmatic tabIndex
      return typeof el.tabIndex === 'number' && el.tabIndex >= 0;
    }
    if (overlay._origin && !isNaturallyFocusable(overlay._origin)) {
      try {
        // Use tabindex="0" to make it keyboard-focusable temporarily; we'll remove it on close.
        overlay._origin.setAttribute('tabindex', '0');
        overlay._originTempTabindex = true;
      } catch (e) {}
    }
    overlay._originFocusTarget = overlay._origin;

    // Attach pan/zoom for images only
    if (kind === 'image' && window.imagePanZoom && typeof window.imagePanZoom.create === 'function') {
      try {
        const imgEl = overlay.querySelector('.' + IMG_CLASS);
        if (imgEl) {
          const pz = window.imagePanZoom.create(imgEl);
          pz.attach && pz.attach();
          if (console && console.log) console.log('[imageLightbox] panZoom attached');
          overlay._panZoom = pz;
          // Sync state from pan/zoom
          if (overlay._state && overlay._state.syncFromPanZoom) {
            overlay._state.syncFromPanZoom(pz);
          }
          // detach on cleanup
          const prevCleanup = overlay._cleanup;
          overlay._cleanup = () => {
            try { pz.detach && pz.detach(); } catch (e) {}
            prevCleanup && prevCleanup();
          };
        }
      } catch (e) {
        // ignore
      }
    }

    // Also listen for wheel events on overlay in case dispatching targets the overlay
    function overlayWheel(e) {
      try {
        if (overlay._panZoom) {
          overlay._panZoom.setScale(overlay._panZoom.scale + (e.deltaY > 0 ? -0.1 : 0.1), e.clientX, e.clientY);
          if (overlay._state && overlay._state.setScale) {
            overlay._state.setScale(overlay._panZoom.scale);
          }
          e.preventDefault();
        }
      } catch (err) {}
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
    // Remove overlay from DOM first, then restore focus on next frames to ensure layout/paint settled
    overlay.remove();
    try {
      const target = origin || overlay._originFocusTarget || overlay._origin || document.body;
      // mark state closed
      if (overlay._state && overlay._state.close) { try { overlay._state.close(); } catch (e) {} }
      if (window.a11y && window.a11y.restoreFocus) {
        // If we didn't add a temporary tabindex earlier, allow restoreFocus to add one
        const needTemp = !overlay._originTempTabindex;
        window.a11y.restoreFocus(target, { tempTabIndex: needTemp });
      } else if (target && typeof target.focus === 'function') {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          try { target.focus(); } catch (e) {}
        }));
      } else {
        // no-op
      }
    } catch (e) {}
  }

  // Public API
  window.imageLightbox = {
    open: function (src, origin) { openOverlay('image', src, origin); },
    openMedia: function (payload, origin) {
      // payload: { kind: 'image'|'video'|'audio', src: string }
      const kind = (payload && payload.kind) || 'image';
      const src = payload && payload.src;
      openOverlay(kind, src, origin);
    },
    close: function () {
      const overlay = document.querySelector('.' + 'image-lightbox');
      if (overlay) closeOverlay(overlay, overlay._origin);
    }
  };

  // Auto-bind to images with data-lightbox attribute
  document.addEventListener('click', (e) => {
    const el = e.target;
    if (!el) return;
    const wantsLB = el.dataset.lightbox !== undefined || el.hasAttribute('data-lightbox');
    if (!wantsLB) return;
    const tag = el.tagName;
    if (tag === 'IMG') {
      e.preventDefault();
      window.imageLightbox.open(el.src, el);
    } else if (tag === 'VIDEO') {
      e.preventDefault();
      // Prefer first source src if present
      const src = el.currentSrc || (el.querySelector('source')?.src) || el.src;
      window.imageLightbox.openMedia({ kind: 'video', src }, el);
    } else if (tag === 'AUDIO') {
      e.preventDefault();
      const src = el.currentSrc || (el.querySelector('source')?.src) || el.src;
      window.imageLightbox.openMedia({ kind: 'audio', src }, el);
    }
  });

})();
