// Minimal ImageLightbox implementation (MVP)
(function () {
  const OVERLAY_CLASS = 'image-lightbox';
  const IMG_CLASS = 'image-lightbox__img';

  function createOverlay(src, origin) {
    const overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.tabIndex = -1;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Image preview');

    const img = document.createElement('img');
    img.className = IMG_CLASS;
    img.src = src;
    img.alt = origin && origin.alt ? origin.alt : 'Image preview';

    overlay.appendChild(img);

    // Zoom controls
    const controls = document.createElement('div');
    controls.className = 'image-lightbox__controls';
    controls.innerHTML = '<button data-zoom="in" aria-label="Zoom in">+</button><button data-zoom="out" aria-label="Zoom out">−</button><button data-zoom="reset" aria-label="Reset zoom">⟳</button>';
    overlay.appendChild(controls);

    // Close when clicking overlay (but not when clicking image)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay(overlay, origin);
      }
    });

    // ESC to close and +/- for zoom
    function onKey(e) {
      if (e.key === 'Escape') closeOverlay(overlay, origin);
      if (e.key === '+') {
        if (overlay._panZoom) overlay._panZoom.setScale(overlay._panZoom.scale + 0.1);
      }
      if (e.key === '-') {
        if (overlay._panZoom) overlay._panZoom.setScale(overlay._panZoom.scale - 0.1);
      }
      if (e.key === '0') {
        if (overlay._panZoom) overlay._panZoom.reset();
      }
    }

    document.addEventListener('keydown', onKey);

    // store cleanup
    overlay._cleanup = () => {
      document.removeEventListener('keydown', onKey);
    };

    // Wire controls
    controls.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const act = btn.dataset.zoom;
      if (!overlay._panZoom) return;
      if (act === 'in') overlay._panZoom.setScale(overlay._panZoom.scale + 0.2);
      if (act === 'out') overlay._panZoom.setScale(overlay._panZoom.scale - 0.2);
      if (act === 'reset') overlay._panZoom.reset();
    });

    return overlay;
  }

  function openOverlay(src, origin) {
    // avoid duplicates
    if (document.querySelector('.' + 'image-lightbox')) return;
    const overlay = createOverlay(src, origin);
    document.body.appendChild(overlay);
    overlay.focus();
    // store last focused element to restore
    overlay._origin = origin || document.activeElement;

    // Attach pan/zoom if available
    if (window.imagePanZoom && typeof window.imagePanZoom.create === 'function') {
      try {
        const pz = window.imagePanZoom.create(img);
        pz.attach && pz.attach();
        console && console.debug && console.debug('[imageLightbox] panZoom attached');
        overlay._panZoom = pz;
        // detach on cleanup
        const prevCleanup = overlay._cleanup;
        overlay._cleanup = () => {
          try { pz.detach && pz.detach(); } catch (e) {}
          prevCleanup && prevCleanup();
        };
      } catch (e) {
        // ignore
      }
    }

    // Also listen for wheel events on overlay in case dispatching targets the overlay
    function overlayWheel(e) {
      try {
        if (overlay._panZoom) {
          overlay._panZoom.setScale(overlay._panZoom.scale + (e.deltaY > 0 ? -0.1 : 0.1), e.clientX, e.clientY);
          e.preventDefault();
        }
      } catch (err) {}
    }
    overlay.addEventListener('wheel', overlayWheel, { passive: false });
    const prevCleanup2 = overlay._cleanup;
    overlay._cleanup = () => {
      overlay.removeEventListener('wheel', overlayWheel);
      prevCleanup2 && prevCleanup2();
    };
  }

  function closeOverlay(overlay, origin) {
    if (!overlay) return;
    if (overlay._cleanup) overlay._cleanup();
    overlay.remove();
    try {
      (origin || overlay._origin || document.body).focus();
    } catch (e) {}
  }

  // Public API
  window.imageLightbox = {
    open: function (src, origin) { openOverlay(src, origin); },
    close: function () {
      const overlay = document.querySelector('.' + 'image-lightbox');
      if (overlay) closeOverlay(overlay, overlay._origin);
    }
  };

  // Auto-bind to images with data-lightbox attribute
  document.addEventListener('click', (e) => {
    const el = e.target;
    if (el && el.tagName === 'IMG' && (el.dataset.lightbox !== undefined || el.hasAttribute('data-lightbox'))) {
      e.preventDefault();
      window.imageLightbox.open(el.src, el);
    }
  });

})();
