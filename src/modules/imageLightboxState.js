// ImageLightbox state model
(function(){
  function create(initial){
    const state = {
      isOpen: false,
      scale: 1,
      panX: 0,
      panY: 0,
      origin: null,
      lastFocusedElement: null,
      open(originEl){
        this.isOpen = true;
        this.origin = originEl || null;
        this.lastFocusedElement = document.activeElement || null;
      },
      close(){
        this.isOpen = false;
      },
      setScale(next){
        this.scale = next;
      },
      panBy(dx,dy){
        this.panX += dx; this.panY += dy;
      },
      reset(){
        this.scale = 1; this.panX = 0; this.panY = 0;
      },
      getTransform(){
        return `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
      },
      syncFromPanZoom(pz){
        if (!pz) return;
        const origSetScale = pz.setScale.bind(pz);
        const origPanBy = pz.panBy.bind(pz);
        const origReset = pz.reset.bind(pz);
        pz.setScale = (s, cx, cy) => { const r = origSetScale(s, cx, cy); this.scale = pz.scale; this.panX = pz.panX; this.panY = pz.panY; return r; };
        pz.panBy = (dx, dy) => { const r = origPanBy(dx, dy); this.panX = pz.panX; this.panY = pz.panY; return r; };
        pz.reset = () => { const r = origReset(); this.scale = pz.scale; this.panX = pz.panX; this.panY = pz.panY; return r; };
      }
    };
    if (initial && typeof initial === 'object') Object.assign(state, initial);
    return state;
  }
  window.imageLightboxState = { create };
})();
