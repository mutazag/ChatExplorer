// Media utilities: classify media type and validate safe sources

export function classifyMediaByExtOrMime(url, mime) {
  const m = (mime || '').toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('audio/')) return 'audio';
  if (m.startsWith('video/')) return 'video';
  const u = (url || '').toLowerCase();
  if (/[?&#]/.test(u)) {
    // strip query/fragment for extension check
    const base = u.split(/[?#]/)[0];
    return classifyByExt(base);
  }
  return classifyByExt(u);
}

function classifyByExt(u) {
  if (u.endsWith('.png') || u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.gif') || u.endsWith('.webp') || u.endsWith('.bmp') || u.endsWith('.svg')) return 'image';
  if (u.endsWith('.mp3') || u.endsWith('.wav') || u.endsWith('.ogg') || u.endsWith('.m4a') || u.endsWith('.flac') || u.endsWith('.aac')) return 'audio';
  if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov') || u.endsWith('.mkv') || u.endsWith('.avi')) return 'video';
  return 'other';
}

// Allow http(s), protocol-relative, relative, and safe data URLs for images/audio/video; disallow javascript: and blob: by default.
export function isSafeSrc(src) {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim();
  // Disallow javascript: and data with non-media types
  const lower = s.toLowerCase();
  if (lower.startsWith('javascript:')) return false;
  if (lower.startsWith('data:')) {
    // Allow only specific media mimetypes
    if (lower.startsWith('data:image/') || lower.startsWith('data:audio/') || lower.startsWith('data:video/')) return true;
    return false;
  }
  // Disallow blob: due to potential origin/leakage; revisit if needed
  if (lower.startsWith('blob:')) return false;
  // Allow http, https, protocol-relative, and relative URLs
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('//')) return true;
  if (lower.startsWith('/') || /^[a-z0-9_.\-/]/i.test(lower)) return true;
  return false;
}
