# Task Breakdown: Conversation Browser

Created: 2025-10-25
Status: Ready

## Phase 1 — Data & Utilities
- [x] Implement `data/conversations/parse.js` (validate, normalize fields)
- [x] Implement `core/sortPaginate.js` (sort by update_time→create_time; page=25)
- [x] Unit tests for sorting, pagination

## Phase 2 — List View
- [x] Implement `ui/listView.js` with pagination controls
- [x] Row template: title (or identifier), human-readable timestamp
- [x] Selection highlight; emits `conversation:selected`
- [x] Unit tests: pagination, selection, title fallback

## Phase 3 — Detail View
- [x] Implement `ui/detailView.js` to render messages in chronological order
- [x] Support roles (user/assistant/system) and timestamps
- [x] Update on `conversation:selected`
- [x] Unit tests: message order, role rendering

## Phase 4 — Integration & UX polish
- [x] Wire state in `state/appState.js` (selectedId, page)
- [x] Optional `router/hash.js` to reflect selected conversation
- [x] Responsive CSS for two-pane layout, accessible focus styles
- [x] Keyboard navigation (Up/Down, Enter)

## Phase 5 — Edge/Error Handling
- [x] Empty dataset state
- [x] Malformed entries skipped with warning (UI status chip shows skipped count)
- [x] Identifier-based title fallback; final fallback: excerpt/“Untitled”

## Phase 6 — Tests & Performance
- [x] Integration test: 1000 conversations, pagination behavior, selection update
- [x] Performance timing within target in `tests/index.html`

## Done Criteria
- [ ] Constitution gate pass checklist complete
- [ ] All unit/integration tests pass in browser harness
