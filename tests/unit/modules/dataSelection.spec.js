import { test, assert } from '../../lib/harness.js';
import { onActiveDataSetChanged, getSessionState } from '../../../src/state/events.js';
import { selectDataSet } from '../../../src/modules/dataSelection.js';

function subscribeOnce() {
  return new Promise((resolve) => {
    const off = onActiveDataSetChanged((state) => { off(); resolve(state); });
  });
}

await test('selectDataSet updates activeDataSetId and emits event', async () => {
  const p = subscribeOnce();
  selectDataSet('US1_A');
  const state = await p;
  assert(state.activeDataSetId === 'US1_A', 'activeDataSetId should equal US1_A');
  const snap = getSessionState();
  assert(snap.activeDataSetId === 'US1_A', 'session snapshot should reflect US1_A');
});
