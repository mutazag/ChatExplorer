import { selectDataSet } from '../../modules/dataSelection.js';
import { setAria } from '../../utils/a11y.js';
import { discoverDatasets } from '../../data/datasets/discovery.js';

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
    // Non-test mode: provide a compact button that opens the chooser.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Choose data set';
    btn.textContent = 'Data Sets';
    btn.addEventListener('click', () => {
      if (typeof opts.onOpenChooser === 'function') opts.onOpenChooser();
    });
    root.appendChild(btn);

    // Graceful handling for no data sets: if none discovered, adjust label.
    // This check is non-blocking and optional; chooser will handle the full UX.
    discoverDatasets().then((list) => {
      if (Array.isArray(list) && list.length === 0) {
        btn.textContent = 'Browse…';
        btn.title = 'Browse files to load conversations';
      }
    }).catch(() => {/* ignore */});
  }

  host.appendChild(root);
  return root;
}
