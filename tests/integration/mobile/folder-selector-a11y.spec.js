import { test, assert } from '../../lib/harness.js';
import { initDataSetControl } from '../../../src/ui/mobile/datasetControl.js';
import '../../../src/utils/a11y.js';

function attach() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  return host;
}

await test('control is labeled and keyboard focusable across themes', async () => {
  const host = attach();
  const control = initDataSetControl(host, { testMode: true });
  assert(control.classList.contains('dataset-control'), 'control should have dataset-control class');

  const btn = control.querySelector('button');
  assert(btn, 'button should exist');
  btn.focus();
  assert(document.activeElement === btn, 'button should be focusable');

  // Light theme
  document.documentElement.setAttribute('data-theme', 'light');
  const lightColor = getComputedStyle(btn).color;
  assert(typeof lightColor === 'string' && lightColor.length > 0, 'button should have color in light theme');

  // Dark theme
  document.documentElement.setAttribute('data-theme', 'dark');
  const darkColor = getComputedStyle(btn).color;
  assert(typeof darkColor === 'string' && darkColor.length > 0, 'button should have color in dark theme');

  // Label should expose a name via aria-label/title/text
  const name = btn.getAttribute('aria-label') || btn.title || btn.textContent;
  assert(name && name.trim().length > 0, 'button should expose accessible name');
});
