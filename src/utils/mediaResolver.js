// Media resolver enforcing safe URL schemes
(function(){
  const ALLOWED = new Set(['http:', 'https:', 'data:', 'blob:']);

  function resolveImageSrc(input){
    if (!input) return '';
    try {
      const u = new URL(input, document.baseURI);
      if (!ALLOWED.has(u.protocol)) throw new Error('Disallowed scheme: ' + u.protocol);
      return u.href;
    } catch (e) {
      // If URL construction fails, block by returning empty string
      return '';
    }
  }

  window.mediaResolver = { resolveImageSrc };
})();
