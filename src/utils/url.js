// URL normalization and truncation helpers

export function normalizeUrl(raw) {
  try {
    // Use the browser URL parser for normalization
    const u = new URL(raw, window.location.href);
    return u.href;
  } catch (e) {
    return raw; // leave as-is if parsing fails
  }
}

export function truncateForDisplay(url, maxLen = 60) {
  if (!url || url.length <= maxLen) return url;
  const prefix = url.slice(0, 30);
  const suffix = url.slice(-20);
  return `${prefix}…${suffix}`;
}
