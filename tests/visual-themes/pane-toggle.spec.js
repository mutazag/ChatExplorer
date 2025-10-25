import { test, assert } from '../lib/harness.js';

test('visual-themes: pane toggle hides/shows left pane and updates aria-expanded', () => {
  const btn = document.getElementById('btn-pane');
  const left = document.getElementById('left');
  const wasExpanded = btn.getAttribute('aria-expanded') === 'true';
  btn.click();
  const nowExpanded = btn.getAttribute('aria-expanded') === 'true';
  assert(nowExpanded !== wasExpanded, 'aria-expanded toggled');
  assert(!!left.hasAttribute('hidden') === wasExpanded, 'left pane visibility toggled');
});
