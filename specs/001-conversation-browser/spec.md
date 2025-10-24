# Feature Specification: Conversation Browser (List + Detail Panes)

**Feature Branch**: `001-conversation-browser`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "After a folder is selected, show conversations from conversations.json in the left pane ordered chronologically; clicking a chat thread shows the chat in the right pane."

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
- **FR-002**: System MUST extract for each conversation: id, title (or fallback), and timestamp
- **FR-003**: System MUST render the left pane list ordered chronologically descending (newest→oldest)
- **FR-004**: System MUST display at least title and human-readable timestamp for each list item
- **FR-005**: System MUST allow selecting a conversation and highlight the active item
- **FR-006**: System MUST render the selected conversation’s message thread with role, timestamp, and text in chronological order
- **FR-007**: System MUST handle missing `title` by using any available identifier from the conversation record (e.g., `conversation_id`, `id`, `uuid`). If no identifier is present, fallback to the first message excerpt or “Untitled”.
- **FR-008**: System MUST handle malformed or missing `conversations.json` with clear error messaging and no crash
- **FR-009**: System SHOULD support large files (≥1000 conversations) with responsive interactions using pagination of 25 conversations per page
- **FR-010**: System MUST avoid network calls and operate entirely client-side using local files

### Key Entities *(include if feature involves data)*

- **Conversation**: id, title, create_time, update_time, summary (optional)
- **Message**: id, role (user/assistant/system), create_time, text
- **ConversationList**: array of Conversation; sort key and direction

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

- `conversations.json` is a JSON array of conversation objects that include at minimum: `id`, `title` (optional), and `create_time` (epoch seconds) [based on typical ChatGPT export]
- If `title` is missing or empty, prefer any available identifier from the conversation record (e.g., `conversation_id`, `id`, `uuid`); if none exists, use the first non-system message snippet as a last resort
- Chronological order is descending (newest→oldest)
