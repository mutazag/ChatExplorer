// Conservative autolinker that converts plain http(s) URLs in HTML fragments
// into anchor elements with data-raw-href attribute. It avoids converting
// text inside A, CODE, PRE elements.
import { normalizeUrl, truncateForDisplay } from './url.js';

export function autolinkHtml(html) {
  if (!html) return '';
  const container = document.createElement('div');
  container.innerHTML = html;

  const urlRe = /\bhttps?:\/\/[^\s<>"'()]+/gi;

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      let match;
      let lastIndex = 0;
      const frag = document.createDocumentFragment();
      urlRe.lastIndex = 0;
      let found = false;
      while ((match = urlRe.exec(text))) {
        found = true;
        const url = match[0];
        const before = text.slice(lastIndex, match.index);
        if (before) frag.appendChild(document.createTextNode(before));
        const a = document.createElement('a');
        // Normalize URL for safe storage and set data-raw-href; sanitizer will enforce allowed schemes
        const norm = normalizeUrl(url);
        a.setAttribute('data-raw-href', norm);
        // Truncate visible text for long URLs but keep full URL in title and aria-label
        const display = truncateForDisplay(url, 80);
        a.textContent = display;
        a.setAttribute('title', norm);
        a.setAttribute('aria-label', norm);
        frag.appendChild(a);
        lastIndex = urlRe.lastIndex;
      }
      if (!found) return; // nothing to do
      const after = text.slice(lastIndex);
      if (after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName;
      // Do not descend into these tags
      if (['A', 'CODE', 'PRE'].includes(tag)) return;
      // Recurse safely over children - copy list first because we may mutate
      const children = Array.from(node.childNodes);
      for (const c of children) walk(c);
    }
  }

  walk(container);
  return container.innerHTML;
}
