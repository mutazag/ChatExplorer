# Implementation Plan: Conversation Browser (List + Detail)

Created: 2025-10-25
Status: Ready
Source Spec: specs/001-conversation-browser/spec.md

## Overview
Render a two-pane browser: left list of conversations from `conversations.json` sorted newest-first by `update_time` (fallback `create_time`) with pagination (25/page); right pane shows selected conversation thread.

## Architecture
- Vanilla HTML/CSS/JS; no build step
- Modules
  - `data/conversations/parse.js` (schema guard, normalization)
  - `core/sortPaginate.js` (sort by update_time→create_time; paginate size 25)
  - `ui/listView.js` (left pane: render, pagination controls, keyboard nav)
  - `ui/detailView.js` (right pane: render messages, roles, timestamps)
  - `state/appState.js` (selectedConversationId, currentPage)
  - `router/hash.js` (optional: reflect selection in `location.hash`)
  - `utils/time.js`, `utils/dom.js`

## Data Model
- Conversation (from export): {
  id: conversation_id,
  title?: string,
  update_time?: number,
  create_time?: number,
  is_archived?: boolean,
  mapping: Record<string, Node>,
  current_node: string
}
- Node: { id: string, parent?: string | null, children: string[], message?: Message | null }
- Message: {
  id: string,
  role: user | assistant | system | tool,
  create_time?: number,
  update_time?: number,
  content: { content_type: 'text' | 'multimodal_text', parts: any[] },
  metadata?: object
}
- ViewState: { page: number, pageSize: 25, selectedId?: string }

## UX & Accessibility
- Left pane: paginated list, active row highlight, titles with fallback to identifier; Prev/Next with disabled states on first/last page; buttons have aria-labels
- Right pane: chronological messages; readable timestamps per spec Time display; preserve whitespace; multimodal image parts represented as non-interactive chips with ARIA labels
- Keyboard: Up/Down to move selection; Enter to open; pagination buttons focusable; optional PageUp/PageDown for paging
- Responsive: columns stack on narrow viewports

## Constitution Gate Check
- Client-side only: PASS
- Minimal dependencies: PASS
- Tests required: PASS (DOM-based harness)
- File-based data: PASS
- Browser compatibility: PASS (hash routing optional)
- UI & Branding: PASS (logo + responsive CSS)

## Phases
1) Data layer: parse and normalize conversations
2) Sorting + pagination utilities
3) ListView with page controls and selection highlight
4) DetailView rendering + selection wiring
5) Title fallback using `title` → `conversation_id` → first non‑system message excerpt; error/empty states
6) Keyboard navigation and hash routing (optional)
7) Tests and performance checks

## Test Plan
- Unit: normalization extracts id=`conversation_id`; reconstructs active path via `current_node` and `mapping`; handles missing/broken nodes gracefully
- Unit: sort by update_time fallback create_time; paginate 25
- Unit: title fallback uses `title` → `conversation_id` → first non‑system excerpt
- Unit: tie-breakers for identical/missing timestamps using `conversation_id`
- Unit: omit visually hidden system scaffolding; represent image assets as placeholders with ARIA labels
- Integration: list renders 25 per page, selection updates detail pane
- Performance: render 1000-conv dataset within targets; no crashes on malformed entries (skipped with warnings)

## Risks & Mitigations
- Missing `update_time` → fallback implemented consistently
- Large datasets → paginate; lazy DOM updates
- Mixed schemas → normalization step with defensive coding
- Branching conversations → choose active path using `current_node`; document behavior clearly
- Multimodal content → render image pointers as non‑blocking placeholders to avoid filesystem coupling
- Timestamp ties → deterministic tertiary key on `conversation_id` to prevent reordering jitter

## Deliverables
- JS modules listed above, minimal HTML/CSS
- `tests/conversation-browser/*.spec.js` + `tests/index.html`
- Documentation: Data model assumptions (export schema), normalization rules, and fallbacks
