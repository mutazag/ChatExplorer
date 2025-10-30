import { test, assert } from '../../lib/harness.js';
import '../../../src/utils/a11y.js'; // attaches window.a11y

await test('setAriaLabel sets aria-label', async () => {
  const el = document.createElement('div');
  window.a11y.setAriaLabel(el, 'Hello');
  assert(el.getAttribute('aria-label') === 'Hello', 'aria-label should be set');
});

await test('restoreFocus moves focus to target', async () => {
  const btn = document.createElement('button');
  document.body.appendChild(btn);
  window.a11y.restoreFocus(btn, { tempTabIndex: true });
  await new Promise((r) => setTimeout(r, 30));
  assert(document.activeElement === btn, 'focus should be on target button');
});
