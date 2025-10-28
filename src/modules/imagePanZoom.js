// Simple pan/zoom module
(function () {
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function ImagePanZoom(img) {
    this.img = img;
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 8;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.lastPointer = null;

    // apply initial transform
    this.update();
  }

  ImagePanZoom.prototype.update = function () {
    const t = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    // use rAF to avoid layout thrash
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      this.img.style.transform = t;
      this.img.style.willChange = 'transform';
    });
  };

  ImagePanZoom.prototype.setScale = function (scale, centerX, centerY) {
    // Optionally adjust pan to zoom at center
    const prev = this.scale;
    scale = clamp(scale, this.minScale, this.maxScale);
    if (centerX != null && prev !== scale) {
      const rect = this.img.getBoundingClientRect();
      const cx = centerX - rect.left - rect.width/2;
      const cy = centerY - rect.top - rect.height/2;
      // adjust pan proportional to scale change
      const factor = (scale/prev) - 1;
      this.panX -= cx * factor;
      this.panY -= cy * factor;
    }
    this.scale = scale;
    this.update();
  };

  ImagePanZoom.prototype.panBy = function (dx, dy) {
    this.panX += dx;
    this.panY += dy;
    this.update();
  };

  ImagePanZoom.prototype.reset = function () {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.update();
  };

  ImagePanZoom.prototype.attach = function () {
    const self = this;

    function onWheel(e) {
      console && console.debug && console.debug('[imagePanZoom] wheel', e.deltaY);
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      self.setScale(self.scale + delta, e.clientX, e.clientY);
    }

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      self.isPanning = true;
      self.lastPointer = { x: e.clientX, y: e.clientY };
      self.img.setPointerCapture && self.img.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!self.isPanning) return;
      const dx = e.clientX - self.lastPointer.x;
      const dy = e.clientY - self.lastPointer.y;
      self.panBy(dx, dy);
      self.lastPointer = { x: e.clientX, y: e.clientY };
    }

    function onPointerUp(e) {
      self.isPanning = false;
      self.lastPointer = null;
      try { self.img.releasePointerCapture && self.img.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    this._handlers = { onWheel, onPointerDown, onPointerMove, onPointerUp };
    this.img.addEventListener('wheel', onWheel, { passive: false });
    this.img.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  ImagePanZoom.prototype.detach = function () {
    if (!this._handlers) return;
    const h = this._handlers;
    this.img.removeEventListener('wheel', h.onWheel);
    this.img.removeEventListener('pointerdown', h.onPointerDown);
    window.removeEventListener('pointermove', h.onPointerMove);
    window.removeEventListener('pointerup', h.onPointerUp);
    this._handlers = null;
  };

  // Expose factory
  window.imagePanZoom = {
    create: function (img) { return new ImagePanZoom(img); }
  };

})();
