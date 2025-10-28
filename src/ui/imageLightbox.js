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

    // Close when clicking overlay (but not when clicking image)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay(overlay, origin);
      }
    });

    // ESC to close
    function onKey(e) {
      if (e.key === 'Escape') closeOverlay(overlay, origin);
    }

    document.addEventListener('keydown', onKey);

    // store cleanup
    overlay._cleanup = () => {
      document.removeEventListener('keydown', onKey);
    };

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
