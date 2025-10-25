import { test, assert } from '../lib/harness.js';
import { mountSettings } from '../../src/ui/settingsPanel.js';
import { getState } from '../../src/state/appState.js';

test('settingsPanel: images toggle disabled for non-sonnet models', () => {
  const dialog = document.createElement('dialog');
  document.body.appendChild(dialog);
  mountSettings(dialog);
  const sel = dialog.querySelector('select');
  sel.value = 'GPT-4o';
  sel.dispatchEvent(new Event('change'));
  const imgToggle = dialog.querySelector('#images-toggle');
  assert(imgToggle.disabled === true, 'images toggle disabled for GPT-4o');
});

test('settingsPanel: save updates default model in state', () => {
  const dialog = document.createElement('dialog');
  document.body.appendChild(dialog);
  mountSettings(dialog);
  const selects = dialog.querySelectorAll('select');
  const defSel = selects[0];
  defSel.value = 'Claude Haiku';
  const form = dialog.querySelector('form');
  form.dispatchEvent(new Event('submit'));
  assert(getState().modelDefault === 'Claude Haiku', 'default model updated');
});
