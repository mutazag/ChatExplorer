import { test, assert } from '../../lib/harness.js';
import { onActiveDataSetChanged, setActiveDataSetId, getSessionState } from '../../../src/state/events.js';

let lastEvent = null;

// Simple subscriber helper for tests
function subscribeOnce() {
  return new Promise((resolve) => {
    const off = onActiveDataSetChanged((state) => {
      lastEvent = state;
      off();
      resolve(state);
    });
  });
}

await test('emits when activeDataSetId changes', async () => {
  const p = subscribeOnce();
  setActiveDataSetId('DATASET_A');
  const state = await p;
  assert(state && state.activeDataSetId === 'DATASET_A', 'activeDataSetId should be DATASET_A');
});

await test('getSessionState reflects latest activeDataSetId', async () => {
  setActiveDataSetId('DATASET_B');
  const s = getSessionState();
  assert(s.activeDataSetId === 'DATASET_B', 'getSessionState.activeDataSetId should be DATASET_B');
});
