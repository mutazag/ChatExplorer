import { test, assert } from '../lib/harness.js';

test('visual-themes: app mounts and controls exist', () => {
  const header = document.querySelector('.app-header');
  assert(header, 'header present');
  const themeBtn = document.getElementById('btn-theme');
  const paneBtn = document.getElementById('btn-pane');
  assert(themeBtn, 'theme toggle present');
  assert(paneBtn, 'pane toggle present');
});
