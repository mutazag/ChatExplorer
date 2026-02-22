/**
 * Dataset selection event bridge.
 *
 * This module provides a stable, minimal API for selecting datasets and
 * listening for dataset changes. It deliberately decouples consumers from
 * appState's internal event naming ('dataset:selected') so that internal
 * refactoring of appState does not break external consumers or tests.
 *
 * Use this module (not appState directly) when wiring dataset selection
 * from UI controls, the mobile dataset dropdown, or the event-bridge tests.
 */
// State eventing helpers for dataset selection (tests-first contract)
import { on, getState, setSelectedDataset } from './appState.js';

function mapState() {
  const s = getState();
  return {
    activeDataSetId: s.selectedDataset?.id ?? null,
    theme: s.theme,
    leftPaneVisible: s.leftPaneVisible,
  };
}

export function onActiveDataSetChanged(handler) {
  // Bridge appState's 'dataset:selected' event, prefer the emitted snapshot to avoid races
  return on('dataset:selected', (snapshot) => {
    const s = snapshot || getState();
    handler({
      activeDataSetId: s?.selectedDataset?.id ?? null,
      theme: s?.theme,
      leftPaneVisible: s?.leftPaneVisible,
    });
  });
}

export function setActiveDataSetId(id) {
  // Minimal object; name/path may be filled by higher-level modules later
  setSelectedDataset(id == null ? null : { id });
}

export function getSessionState() {
  return mapState();
}
