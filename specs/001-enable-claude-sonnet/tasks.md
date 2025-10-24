# Task Breakdown: Enable Claude Sonnet 4.5 (Settings)

Created: 2025-10-25
Status: Ready

## Phase 1 — Storage & Policy
- [ ] Implement `settings/modelSettings.js` (get/set default in localStorage)
- [ ] Implement `policy/modelPolicy.js` (effective model = session override || default || fallback)
- [ ] Unit tests: precedence, defaults

## Phase 2 — UI
- [ ] Implement `ui/settingsPanel.js` with model selector (Sonnet 4.5 default)
- [ ] Implement `ui/badges/modelBadge.js` showing current model in header
- [ ] Wire image channel capability toggle in UI
- [ ] Unit tests: UI reflects policy, badge updates on change

## Phase 3 — Session Overrides
- [ ] Implement session-scoped override controls; clear on reload
- [ ] Unit tests: override behavior and clearing

## Phase 4 — Observability
- [ ] Add in-memory audit log for settings changes; export JSON button
- [ ] Unit tests: log entries structure

## Done Criteria
- [ ] Constitution gate pass checklist complete
- [ ] All unit tests pass in browser harness
