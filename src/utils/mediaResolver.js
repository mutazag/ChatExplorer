// Media resolver enforcing safe URL schemes
const ALLOWED = new Set(['http:', 'https:', 'data:', 'blob:']);

export function resolveImageSrc(input) {
  if (!input) return '';
  try {
    const u = new URL(input, document.baseURI);
    if (!ALLOWED.has(u.protocol)) throw new Error('Disallowed scheme: ' + u.protocol);
    return u.href;
  } catch (e) {
    // If URL construction fails or scheme is disallowed, block by returning empty string
    return '';
  }
}
