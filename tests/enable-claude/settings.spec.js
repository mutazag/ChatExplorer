import { test, assert } from '../lib/harness.js';
import { getDefaultModel, setDefaultModel } from '../../src/settings/modelSettings.js';

test('modelSettings: persists default model in localStorage', () => {
  const prev = getDefaultModel();
  setDefaultModel('Claude Sonnet 4.5');
  const after = getDefaultModel();
  assert(after === 'Claude Sonnet 4.5', 'persisted default');
  // restore
  setDefaultModel(prev);
});
