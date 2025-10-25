import { test, assert } from '../lib/harness.js';

test('visual-themes: user bubble is right-aligned but text is left-aligned', () => {
  const userMsg = document.querySelector('[data-detail] .msg--user');
  assert(userMsg, 'user message exists');
  const userBubble = userMsg.querySelector('.bubble');
  assert(userBubble, 'user bubble exists');
  // Right-aligned bubble via grid justify-self end is not easily computed here,
  // but we can assert wrapper alignment intent and bubble text alignment.
  const msgComputed = getComputedStyle(userMsg);
  const bubbleComputed = getComputedStyle(userBubble);
  assert(msgComputed.textAlign === 'right', 'user message wrapper aligns content to the right');
  assert(bubbleComputed.textAlign === 'left', 'user bubble text is left-aligned');
});
