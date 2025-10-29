// Utility: truncate a string with a middle ellipsis to a maximum length
// Returns empty string for null/undefined; coerces non-strings.
export function truncateMiddle(input, max = 40) {
  try {
    if (input === null || input === undefined) return '';
    const s = String(input);
    const n = Number(max);
    const limit = Number.isFinite(n) && n > 0 ? Math.floor(n) : 40;
    if (s.length <= limit) return s;
    if (limit <= 3) return s.slice(0, limit);
    const ellipsis = '…';
    const keep = limit - ellipsis.length;
    const head = Math.ceil(keep / 2);
    const tail = Math.floor(keep / 2);
    return s.slice(0, head) + ellipsis + s.slice(s.length - tail);
  } catch {
    return '';
  }
}
