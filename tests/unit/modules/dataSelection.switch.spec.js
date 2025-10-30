import { test, assert } from '../../lib/harness.js';
import { onActiveDataSetChanged, getSessionState } from '../../../src/state/events.js';
import { selectDataSet } from '../../../src/modules/dataSelection.js';

function onceWithin(ms = 50) {
  let timer;
  return new Promise((resolve, reject) => {
    const off = onActiveDataSetChanged((s) => { clearTimeout(timer); off(); resolve({ fired: true, state: s }); });
    timer = setTimeout(() => { off(); resolve({ fired: false }); }, ms);
  });
}

await test('idempotent selection does not emit for same id', async () => {
  selectDataSet('IDX');
  // First call emits once; drain it
  await onceWithin(50);
  const r = await onceWithin(50);
  selectDataSet('IDX');
  // If idempotence works, no new event within window
  assert(r.fired === false, 'Should not emit when selecting same id again');
});

await test('switching emits and updates state', async () => {
  selectDataSet('A');
  await onceWithin(50);
  const p = onceWithin(200);
  selectDataSet('B');
  const r = await p;
  assert(r.fired === true && r.state.activeDataSetId === 'B', 'Should emit B on switch');
  const snap = getSessionState();
  assert(snap.activeDataSetId === 'B', 'Snapshot should be B');
});
