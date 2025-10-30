// Data selection module: tests-first implementation for US1
import { setActiveDataSetId, getSessionState } from '../state/events.js';

/**
 * Select a data set by id and emit change event.
 * For US1, this only updates session state; loading and UI binding happen elsewhere.
 * @param {string} dataSetId
 */
let _debounceTimer = null;
let _pendingId = null;

export function selectDataSet(dataSetId) {
  const curr = getSessionState().activeDataSetId;
  if (String(curr) === String(dataSetId)) return; // idempotent: no-op
  _pendingId = dataSetId;
  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    if (_pendingId != null) setActiveDataSetId(_pendingId);
    _pendingId = null;
    _debounceTimer = null;
  }, 30);
}
