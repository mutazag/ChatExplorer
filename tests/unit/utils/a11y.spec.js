import { test, assert } from '../../lib/harness.js';
import { setAria, focusFirstDescendant, restoreFocus } from '../../../src/utils/a11y.js';

await test('setAria sets and removes attributes', async () => {
  const el = document.createElement('div');
  setAria(el, { 'aria-label': 'Hello', 'aria-hidden': false });
  assert(el.getAttribute('aria-label') === 'Hello', 'aria-label should be set');
  assert(!el.hasAttribute('aria-hidden'), 'aria-hidden false should remove attribute');
  setAria(el, { 'aria-label': null });
  assert(!el.hasAttribute('aria-label'), 'null removes attribute');
});

await test('focusFirstDescendant moves focus to first control', async () => {
  const host = document.createElement('div');
  const input = document.createElement('button');
  host.appendChild(input);
  document.body.appendChild(host);
  const moved = focusFirstDescendant(host);
  assert(moved === true, 'should move focus');
  assert(document.activeElement === input, 'focus should be on button');
  restoreFocus(document.body);
});
