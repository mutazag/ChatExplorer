# Feature Specification: Conversation Browser (List + Detail Panes)

**Feature Branch**: `001-conversation-browser`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "After a folder is selected, show conversations from conversations.json in the left pane ordered chronologically; clicking a chat thread shows the chat in the right pane."

## Clarifications

### Session 2025-10-25

- Q: Which timestamp should drive the left‑pane “newest first” sort? → A: Sort by `update_time`; fallback to `create_time`.

### Sorting rules (deterministic)

- Primary key: `update_time` (descending)
- Secondary key: `create_time` (descending) when `update_time` is equal or missing
- Tertiary key: `conversation_id` (ascending, string compare) to ensure stable ordering when both timestamps are equal/missing

### Time display format

- Inputs are epoch seconds (possibly floats)
- List items: show human‑readable timestamp using local timezone
  - If < 24h difference from now: use relative format like "2h ago", "15m ago"
  - Else: absolute format `YYYY‑MM‑DD HH:mm` (local)
  - If no time available: use an em dash (—)

### Active path reconstruction

- Reconstruct the visible message sequence along the active branch ending at `current_node`
- Algorithm:
  1) Start at `current_node`; walk `parent` pointers to the root, collecting nodes
  2) Reverse the collected nodes to chronological order
  3) Exclude nodes not on this path (branches)
  4) If a node is missing or broken, stop at the last valid parent and continue rendering gracefully

### System/tool messages and multimodal

- Omit visually hidden system scaffolding: exclude messages where `author.role === 'system'` AND `metadata.is_visually_hidden_from_conversation === true`
- Tool messages are omitted from text rendering except for representing multimodal assets
- Multimodal image parts (content_type = `image_asset_pointer`) are represented inline as non‑interactive placeholder chips
  - Label: `Image` with optional index per conversation (e.g., `Image 1`)
  - ARIA label: `Image asset`
  - If metadata `image_gen_title` is present, surface as a title/tooltip; clicking is not required

### Data model confirmation (from real export)

- Source file format matches a ChatGPT-style export: an array of conversation objects with keys:
  - `title: string | null`
  - `create_time: number | null` (epoch seconds, often float)
  - `update_time: number | null`
  - `mapping: Record<string, Node>` where each `Node` has `{ id, message, parent, children[] }`
  - `current_node: string` identifier of the active leaf node in the mapping
  - `conversation_id: string` stable identifier for the conversation
  - `moderation_results: []`, `plugin_ids: null`, `is_archived: boolean`
- Node.message shape:
  - `author.role`: one of `system | user | assistant | tool`
  - `content.content_type`: `text` or `multimodal_text`
    - `text.parts`: string[] (free-form text)
    - `multimodal_text.parts`: may include image assets with `{ content_type: 'image_asset_pointer', asset_pointer: 'sediment://...' }`
  - `create_time: number | null`, `update_time: number | null`
  - `metadata` contains fields like `model_slug`, flags, and generation metadata

Implications for the UI/normalization:
- Conversation id MUST use `conversation_id` (not `id`).
- Title: prefer top-level `title` when truthy; fallback to `conversation_id`; fallback to first non-system message excerpt.
- Messages are reconstructed from the `mapping` graph using the active branch ending at `current_node`; system messages marked as visually hidden SHOULD be omitted from the detail view.
- Image assets referenced in `multimodal_text` MAY be surfaced as non-blocking placeholders or chips; rendering actual images is optional.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - List Conversations (Priority: P1)

As a user, after selecting a data folder, I need to see all conversations from its `conversations.json` in the left pane in chronological order so I can quickly find a chat to open.

**Why this priority**: This is the main navigation surface that enables any chat viewing.

**Independent Test**: Provide a sample `conversations.json` with 10 conversations; verify the left pane renders all 10 in chronological order with readable titles and timestamps.

**Acceptance Scenarios**:

1. **Given** a valid `conversations.json`, **When** the app loads the selected folder, **Then** the left pane lists all conversations sorted chronologically descending (newest→oldest)
2. **Given** conversations without titles, **When** the list renders, **Then** a fallback label (e.g., first message excerpt or “Untitled”) is displayed

---

### User Story 2 - View Conversation Detail (Priority: P2)

As a user, when I click a conversation in the left pane, I need to see its full message thread in the right pane so I can read the conversation content.

**Why this priority**: This is the core reading experience.

**Independent Test**: Click any item in the left pane; verify the right pane shows messages in correct order with author roles and timestamps.

**Acceptance Scenarios**:

1. **Given** a conversation is selected, **When** it loads, **Then** messages display in chronological order with role (user/assistant/system), timestamp, and text content
2. **Given** the user selects another conversation, **When** the selection changes, **Then** the right pane updates to the new conversation without full page reload

---

### User Story 3 - Robustness and Large Files (Priority: P3)

As a user, I want the app to handle missing/invalid `conversations.json` and large files gracefully so I can still navigate or fix issues.

**Why this priority**: Improves reliability and UX for real-world exports.

**Independent Test**: Use a malformed JSON file and a 10MB file; verify error messaging and responsiveness.

**Acceptance Scenarios**:

1. **Given** `conversations.json` is missing or malformed, **When** loading, **Then** a clear error is shown with guidance and no crashes occur
2. **Given** `conversations.json` contains >1000 conversations, **When** listing, **Then** the UI remains responsive with pagination of 25 conversations per page

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Empty conversations array
- Missing fields like `title`, `id`, or `create_time`
- Duplicate or null timestamps; timezone differences
- Conversations with only system messages or attachments
- Extremely long titles or messages (truncation in list, full in detail)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST read and parse `conversations.json` from the selected folder
- **FR-002**: System MUST extract for each conversation: `conversation_id` (as id), title (or fallback), and timestamp
- **FR-003**: System MUST render the left pane list ordered chronologically descending (newest→oldest) using `update_time`; fallback to `create_time`; ties resolved by `conversation_id` ascending (deterministic)
- **FR-004**: System MUST display at least title and human-readable timestamp for each list item using the Time display format; show em dash when unavailable
- **FR-005**: System MUST allow selecting a conversation and highlight the active item
- **FR-006**: System MUST render the selected conversation’s message thread with role, timestamp, and text in chronological order along the active branch identified by `current_node`; omit visually hidden system scaffolding per rules; represent multimodal image parts as non‑interactive placeholder chips
- **FR-007**: System MUST handle missing `title` by using `conversation_id` when available. If not present, fallback to the first non-system message excerpt; otherwise render “Untitled”.
- **FR-008**: System MUST handle malformed or missing `conversations.json` with clear error messaging and no crash
- **FR-009**: System SHOULD support large files (≥1000 conversations) with responsive interactions using pagination of 25 conversations per page
- **FR-010**: System MUST avoid network calls and operate entirely client-side using local files

### Key Entities *(include if feature involves data)*

- **Conversation**: { id: `conversation_id`, title?: string, create_time?: number, update_time?: number, is_archived?: boolean }
- **Node** (internal): { id: string, parent?: string | null, children: string[], message?: Message | null }
- **Message**: { id: string, role: user|assistant|system|tool, create_time?: number, update_time?: number, content: Text | MultiModal }
  - Text: { type: 'text', parts: string[] }
  - MultiModal: { type: 'multimodal_text', parts: (image pointers, text snippets) } — image pointers are rendered as `Image` placeholder chips with ARIA label and optional title; no interaction required
- **ConversationList**: array<Conversation>; sort key: `update_time` if present else `create_time`; direction: descending (newest→oldest)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Left pane renders 1000 conversations in ≤1.0s on a typical laptop
- **SC-002**: Selecting a conversation updates the detail pane in ≤500ms
- **SC-003**: 0 crashes for missing/malformed `conversations.json`; helpful error shown within 1s
- **SC-004**: 95% of usability test participants locate and open a target conversation in ≤10s
- **SC-005**: Sorting correctness: 100% of items ordered newest→oldest

## Assumptions

- `conversations.json` is a JSON array of conversation objects matching ChatGPT export format with `conversation_id`, `mapping`, and `current_node`
- `id` MAY NOT be present at the conversation level; use `conversation_id` as the canonical id
- If `title` is missing or empty, prefer `conversation_id`; if unavailable, use the first non-system message snippet as a last resort
- Detail messages are reconstructed along the active path defined by `current_node`; branch messages off the active path are excluded from the main view
- Chronological order is descending (newest→oldest)

## Error and empty states

- Missing/malformed file: Display inline error message in the app shell (aria‑live region), e.g., "Could not load conversations.json" with brief guidance to select a valid export folder
- Empty dataset: Display empty state text in the list pane, e.g., "No conversations found"

## Non‑functional constraints

- Client‑side only; no network calls or external services (evergreen browsers: Chrome/Edge/Firefox latest; Safari best‑effort)
- Pagination size is fixed at 25 for MVP; configurability may be considered later with explicit requirements
