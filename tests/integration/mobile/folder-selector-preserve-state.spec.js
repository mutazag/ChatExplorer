import { test, assert } from '../../lib/harness.js';
import { initDataSetControl } from '../../../src/ui/mobile/datasetControl.js';
import { onActiveDataSetChanged } from '../../../src/state/events.js';
import { setTheme, setLeftPaneVisible, getState } from '../../../src/state/appState.js';

function once() {
  return new Promise((resolve) => {
    const off = onActiveDataSetChanged((s) => { off(); resolve(s); });
  });
}

await test('theme/layout preserved across dataset switch', async () => {
  // Arrange theme and layout
  setTheme('dark');
  setLeftPaneVisible(true);
  const before = getState();

  // Mount control
  const host = document.createElement('div');
  document.body.appendChild(host);
  const control = initDataSetControl(host, { testMode: true });
  assert(control, 'control should mount');

  // Stamp to detect reload (would reset globals)
  window.__NO_RELOAD_STAMP__ = (window.__NO_RELOAD_STAMP__ || 0) + 1;
  const stampBefore = window.__NO_RELOAD_STAMP__;

  // Switch A -> B
  let p = once();
  control.querySelector('[data-test-pick="TEST_MOBILE_A"]').click();
  await p;
  p = once();
  control.querySelector('[data-test-pick="TEST_MOBILE_B"]').click();
  await p;

  const after = getState();
  assert(after.theme === 'dark', 'theme should remain dark');
  assert(after.leftPaneVisible === true, 'left pane visibility should be preserved');
  assert(window.__NO_RELOAD_STAMP__ === stampBefore, 'page should not reload');
});
