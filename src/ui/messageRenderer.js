import { renderMarkdownToSafeHtml } from '../utils/markdown.js';
import { attachTooltipHandlers } from './tooltip.js';

/**
 * Improved RTL heuristic: counts RTL vs LTR characters rather than testing
 * for the mere presence of any RTL character (which fails on mixed Arabic/English).
 * @param {string} text
 * @returns {boolean}
 */
function isProbablyRtl(text) {
  if (!text) return false;
  const rtlChars = (text.match(/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/g) || []).length;
  const ltrChars = (text.match(/[A-Za-z\u00C0-\u024F]/g) || []).length;
  return rtlChars > ltrChars;
}

/**
 * Renders a single message row (header + bubble + timestamp).
 * Does NOT render media items — those are assembled by the caller via renderMediaItems.
 * @param {object} m - Message object with role, text, create_time, etc.
 * @returns {HTMLElement} The message row element
 */
export function renderMessage(m) {
  const roleName = m.role || 'unknown';
  const row = document.createElement('div');
  row.setAttribute('data-msg', '');
  const rtl = isProbablyRtl(m.text || '');
  row.className = 'msg ' + (roleName === 'user' ? 'msg--user' : 'msg--assistant') + (rtl ? ' is-rtl' : '');

  // Header: icon + role label
  const header = document.createElement('div');
  header.className = 'msg-header';
  const icon = document.createElement('img');
  if (roleName === 'user') {
    icon.src = 'assets/user-human.svg';
    icon.alt = 'User';
  } else {
    icon.src = 'assets/assistant-robot.svg';
    icon.alt = 'Assistant';
  }
  // Make icon keyboard-focusable to enable tooltip on focus
  icon.tabIndex = 0;
  try { attachTooltipHandlers(icon, m); } catch {}
  const label = document.createElement('span');
  label.textContent = roleName + ':';
  header.appendChild(icon);
  header.appendChild(label);

  // Bubble: sanitized markdown
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.setAttribute('dir', 'auto');
  bubble.innerHTML = renderMarkdownToSafeHtml(m.text || '');

  row.appendChild(header);
  row.appendChild(bubble);

  // Timestamp (hidden by default; reveal via hover/focus/tap)
  if (m.create_time) {
    const ts = document.createElement('div');
    ts.className = 'timestamp';
    try {
      const d = new Date(m.create_time * 1000 || m.create_time);
      ts.textContent = d.toLocaleString();
    } catch {
      ts.textContent = String(m.create_time);
    }
    row.appendChild(ts);
    row.addEventListener('click', () => {
      row.classList.toggle('is-tapped');
    });
  }

  return row;
}
