import { test, assert } from '../lib/harness.js';

test('visual-themes: theme toggles data-theme attribute', () => {
  const btn = document.getElementById('btn-theme');
  const before = document.documentElement.getAttribute('data-theme') || 'light';
  btn.click();
  const after = document.documentElement.getAttribute('data-theme');
  assert(after && after !== before, 'theme toggled');
  btn.click();
  const back = document.documentElement.getAttribute('data-theme');
  assert(back === before, 'theme toggled back');
});
