# Task Breakdown: Folder Selector

Created: 2025-10-25
Status: Ready

## Phase 1 — Scaffolding
- [ ] Create `index.html` with responsive header and MagTech.ai logo (local `assets/logo.png`)
- [ ] Add minimal `styles.css` (mobile-first; accessible color contrast)
- [ ] Set up `tests/index.html` simple harness with assertion helper

## Phase 2 — Folder Selection
- [x] Implement `features/folder/selectFolder.js` using File System Access API when available
- [x] Add fallback `<input type="file" webkitdirectory>`; if unsupported, allow picking `conversations.json` directly
- [x] Normalize selection via `data/files/listing.js`

## Phase 3 — File Detection & Validation
- [x] Implement `data/conversations/loadConversationsFile.js` to find `conversations.json`
- [ ] Validate presence; compute basic metadata; show status chip in UI
- [x] Error handling: missing, unreadable, or too large files with user guidance

## Phase 4 — State & Emission
- [ ] Implement `state/appState.js` with in-memory state + minimal `localStorage` persistence of folder name
- [ ] Emit custom event `extract:ready` with path/handle for downstream features

## Phase 5 — Tests
- [x] Unit: file listing normalization (happy/edge)
- [x] Unit: conversations file detection (present/absent)
- [ ] Integration: simulate folder selection; verify status updates
- [x] Negative: malformed JSON triggers error messaging

## Done Criteria
- [ ] Constitution gate pass checklist complete
- [ ] All unit tests pass in `tests/index.html`
- [ ] Manual walkthrough with sample export confirms behaviors
