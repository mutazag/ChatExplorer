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
  // Bridge appState's 'dataset:selected' event to a normalized state shape
  return on('dataset:selected', () => handler(mapState()));
}

export function setActiveDataSetId(id) {
  // Minimal object; name/path may be filled by higher-level modules later
  setSelectedDataset(id == null ? null : { id });
}

export function getSessionState() {
  return mapState();
}
