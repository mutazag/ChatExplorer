import { renderMessage } from './messageRenderer.js';
import { renderMediaItems } from './mediaRenderer.js';
import { renderDetailHeader } from './detailHeader.js';

/**
 * Renders a conversation's messages into the given host element.
 * Orchestrates message + media assembly; all element construction
 * is delegated to messageRenderer and mediaRenderer.
 * @param {HTMLElement} host - Container element to render into
 * @param {object|null} conversation - Conversation object with messages array
 */
export function renderDetail(host, conversation) {
  host.innerHTML = '';

  // Mobile: sticky conversation selector (hidden on desktop via CSS)
  const header = renderDetailHeader();
  if (header) host.appendChild(header);

  if (!conversation) {
    const empty = document.createElement('p');
    empty.textContent = 'No conversation selected.';
    host.appendChild(empty);
    return;
  }
  if (!Array.isArray(conversation.messages)) {
    const empty = document.createElement('p');
    empty.textContent = 'This conversation has no messages.';
    host.appendChild(empty);
    return;
  }

  const msgs = [...conversation.messages].sort((a, b) => (a.create_time ?? 0) - (b.create_time ?? 0));
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-detail', '');

  for (const m of msgs) {
    const row = renderMessage(m);
    const mediaEl = Array.isArray(m.media) && m.media.length ? renderMediaItems(m.media) : null;
    if (mediaEl) {
      const bubble = row.querySelector('.bubble');
      if (bubble) {
        bubble.appendChild(mediaEl);
        // Mark media-only bubbles so CSS can set appropriate min-width
        if (!m.text || !m.text.trim()) {
          bubble.classList.add('bubble--media-only');
        }
      }
    }
    wrapper.appendChild(row);
  }

  host.appendChild(wrapper);
}
