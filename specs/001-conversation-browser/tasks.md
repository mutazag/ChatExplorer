# Task Breakdown: Conversation Browser

Created: 2025-10-25
Status: Ready

## Phase 1 — Data & Utilities
- [ ] Implement `data/conversations/parse.js` (validate, normalize fields)
- [ ] Implement `core/sortPaginate.js` (sort by update_time→create_time; page=25)
- [ ] Unit tests for sorting, pagination

## Phase 2 — List View
- [ ] Implement `ui/listView.js` with pagination controls
- [ ] Row template: title (or identifier), human-readable timestamp
- [ ] Selection highlight; emits `conversation:selected`
- [ ] Unit tests: pagination, selection, title fallback

## Phase 3 — Detail View
- [ ] Implement `ui/detailView.js` to render messages in chronological order
- [ ] Support roles (user/assistant/system) and timestamps
- [ ] Update on `conversation:selected`
- [ ] Unit tests: message order, role rendering

## Phase 4 — Integration & UX polish
- [ ] Wire state in `state/appState.js` (selectedId, page)
- [ ] Optional `router/hash.js` to reflect selected conversation
- [ ] Responsive CSS for two-pane layout, accessible focus styles
- [ ] Keyboard navigation (Up/Down, Enter)

## Phase 5 — Edge/Error Handling
- [ ] Empty dataset state
- [ ] Malformed entries skipped with warning
- [ ] Identifier-based title fallback; final fallback: excerpt/“Untitled”

## Phase 6 — Tests & Performance
- [ ] Integration test: 1000 conversations, pagination behavior, selection update
- [ ] Performance timing within target in `tests/index.html`

## Done Criteria
- [ ] Constitution gate pass checklist complete
- [ ] All unit/integration tests pass in browser harness
