import { test, assert } from '../lib/harness.js';

function allBubbles() {
  return Array.from(document.querySelectorAll('[data-detail] .bubble'));
}

test('visual-themes: message bubbles have dir=auto for RTL/LTR autodetection', () => {
  const bubbles = allBubbles();
  assert(bubbles.length > 0, 'has at least one message bubble');
  const allAuto = bubbles.every(b => b.getAttribute('dir') === 'auto');
  assert(allAuto, 'all bubbles use dir="auto"');
});
