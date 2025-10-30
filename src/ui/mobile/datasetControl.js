import { selectDataSet } from '../../modules/dataSelection.js';
import { setAria } from '../../utils/a11y.js';
import { onActiveDataSetChanged, getSessionState } from '../../state/events.js';
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

  // Active dataset label
  const label = document.createElement('span');
  label.className = 'label';
  label.title = '';
  const updateLabel = () => {
    const id = getSessionState().activeDataSetId;
    label.textContent = id ? String(id) : 'No dataset';
    label.title = label.textContent;
  };
  updateLabel();
  onActiveDataSetChanged(updateLabel);

  if (opts.testMode) {
    // Minimal buttons for integration testing of switching behavior
    const mk = (id) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-test-pick', id);
      b.textContent = `Pick ${id}`;
      b.addEventListener('click', () => selectDataSet(id));
      return b;
    };
    root.appendChild(mk('TEST_MOBILE_A'));
    root.appendChild(mk('TEST_MOBILE_B'));
    root.appendChild(label);
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
    root.appendChild(label);

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
