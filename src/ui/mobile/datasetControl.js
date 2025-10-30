import { selectDataSet } from '../../modules/dataSelection.js';
import { setAria } from '../../utils/a11y.js';

/**
 * Initialize the mobile data set control inside a host container.
 * Returns the root element of the control.
 * @param {HTMLElement} host
 * @param {{ testMode?: boolean }} [opts]
 */
export function initDataSetControl(host, opts = {}) {
  if (!host) throw new Error('host container required');
  const root = document.createElement('div');
  root.className = 'dataset-control';
  setAria(root, { role: 'group', 'aria-label': 'Data set' });

  if (opts.testMode) {
    // Minimal button for integration testing that picks a fixed dataset id
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-test-pick', 'TEST_MOBILE_A');
    btn.textContent = 'Pick TEST_MOBILE_A';
    btn.addEventListener('click', () => selectDataSet('TEST_MOBILE_A'));
    root.appendChild(btn);
  } else {
    // Placeholder UI; real chooser wiring will be added in later tasks
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Choose data set';
    btn.textContent = 'Data Sets';
    btn.addEventListener('click', () => {
      // In non-test mode, this will open the full chooser (to be implemented)
      // For now, no-op.
    });
    root.appendChild(btn);
  }

  host.appendChild(root);
  return root;
}
