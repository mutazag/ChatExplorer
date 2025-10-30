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
  selectDataSet('extract1');
  const state = await p;
  assert(state.activeDataSetId === 'extract1', 'activeDataSetId should equal extract1');
  const snap = getSessionState();
  assert(snap.activeDataSetId === 'extract1', 'session snapshot should reflect extract1');
});
