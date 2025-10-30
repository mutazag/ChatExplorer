import { test, assert } from '../../lib/harness.js';
import { onActiveDataSetChanged } from '../../../src/state/events.js';
// Component to be implemented in T013
import { initDataSetControl } from '../../../src/ui/mobile/datasetControl.js';

function attach(container = document.body) {
  const host = document.createElement('div');
  host.id = 'mobile-host';
  container.appendChild(host);
  return host;
}

function subscribeOnce() {
  return new Promise((resolve) => {
    const off = onActiveDataSetChanged((s) => { off(); resolve(s); });
  });
}

await test('mobile control is discoverable and triggers selection', async () => {
  const host = attach();
  const control = initDataSetControl(host, { testMode: true });
  assert(control && control.classList.contains('dataset-control'), 'dataset control should be rendered');

  const p = subscribeOnce();
  // In testMode, the control renders a test button for dataset TEST_MOBILE_A
  const btn = control.querySelector('[data-test-pick="TEST_MOBILE_A"]');
  assert(btn, 'test pick button not found');
  btn.click();
  const state = await p;
  assert(state.activeDataSetId === 'TEST_MOBILE_A', 'activeDataSetId should be TEST_MOBILE_A');
});
