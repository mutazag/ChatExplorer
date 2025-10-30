// Data selection module: tests-first implementation for US1
import { setActiveDataSetId } from '../state/events.js';

/**
 * Select a data set by id and emit change event.
 * For US1, this only updates session state; loading and UI binding happen elsewhere.
 * @param {string} dataSetId
 */
export function selectDataSet(dataSetId) {
  setActiveDataSetId(dataSetId);
}
