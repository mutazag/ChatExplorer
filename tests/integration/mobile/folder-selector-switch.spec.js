import { test, assert } from '../../lib/harness.js';
import { onActiveDataSetChanged, getSessionState } from '../../../src/state/events.js';
import { initDataSetControl } from '../../../src/ui/mobile/datasetControl.js';

function attach(container = document.body) {
  const host = document.createElement('div');
  host.id = 'mobile-host-switch';
  container.appendChild(host);
  return host;
}

function once() {
  return new Promise((resolve) => {
    const off = onActiveDataSetChanged((s) => { off(); resolve(s); });
  });
}

await test('switching A→B via control emits and updates state', async () => {
  const host = attach();
  const control = initDataSetControl(host, { testMode: true });
  const btnA = control.querySelector('[data-test-pick="TEST_MOBILE_A"]');
  const btnB = control.querySelector('[data-test-pick="TEST_MOBILE_B"]');
  assert(btnA && btnB, 'Both A and B test buttons should render');

  // Pick A first
  let p = once();
  btnA.click();
  let s = await p;
  assert(s.activeDataSetId === 'TEST_MOBILE_A', 'A should be active after first pick');

  // Then switch to B
  p = once();
  btnB.click();
  s = await p;
  assert(s.activeDataSetId === 'TEST_MOBILE_B', 'B should be active after switch');

  const snap = getSessionState();
  assert(snap.activeDataSetId === 'TEST_MOBILE_B', 'Snapshot should be B');
});
