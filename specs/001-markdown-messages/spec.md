# Feature Specification: Conversation detail renders Markdown messages

**Feature Branch**: `001-markdown-messages`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "conversation browser should display content messages in markdown"

## User Scenarios & Testing

### User Story 1 - Readable rich text in detail (Priority: P1)

As a user, when I select a conversation, I want assistant/user messages to display with basic Markdown styling (headings, lists, bold/italic, code blocks, links) so content is readable and structured.

Why this priority: It directly improves comprehension of most conversations and is the core value of the feature.

Independent Test: Open tests and render a message containing Markdown; verify elements like <strong>, <em>, <pre><code>, <ul>/<ol>, and <a> are present appropriately.

Acceptance Scenarios:

1. Given a message with "**bold** and `code`", When I view it, Then the UI shows <strong> and <code> elements.
2. Given a message with a fenced code block, When I view it, Then the UI shows a <pre><code> block with preserved whitespace.
3. Given a message with a list (- item), When I view it, Then the UI shows a <ul> with <li> items.

---

### User Story 2 - Safe links and sanitization (Priority: P1)

As a user, links should work safely and the app must not execute untrusted HTML or scripts from conversation content.

Why this priority: Prevents XSS and unsafe navigation; must be guaranteed.

Independent Test: Provide content that includes "[x](javascript:alert(1))" and "<script>"; verify no script executes and unsafe links are removed; http(s) links open in a new tab with rel="noopener noreferrer nofollow".

Acceptance Scenarios:

1. Given content with a <script> tag, When rendered, Then the script tag is not present in the DOM.
2. Given content with a javascript: URL, When rendered, Then no clickable link is produced for that URL (text only).
3. Given content with an https URL, When rendered, Then it is an <a> with target="_blank" and rel="noopener noreferrer nofollow".

---

### User Story 3 - Plain text fallback and accessibility (Priority: P2)

As a user, if content is plain text or malformed Markdown, it should still render as readable paragraphs; code blocks are announced accessibly.

Why this priority: Ensures robustness and basic a11y.

Independent Test: Render simple text and malformed Markdown; verify paragraphs appear and no crashes occur; code blocks have role="region" and aria-label="code block".

Acceptance Scenarios:

1. Given plain text without Markdown, When rendered, Then it appears as paragraphs with line breaks preserved.
2. Given a code block, When rendered, Then the <pre> element has an aria-label indicating "code block".

### Edge Cases

- Empty or null message text: render nothing for the body (keep role/time label).
- Very long lines: do not cause layout break; rely on CSS word-wrap/overflow (no horizontal scroll required for MVP).
- Mixed HTML in content: treat as text; only Markdown subset is interpreted; any embedded HTML tags are stripped during sanitization.
- Large lists or many headings: performance remains acceptable; parsing is synchronous and linear in input size.

## Requirements

### Functional Requirements

- FR-001: System MUST render a safe subset of Markdown in message bodies: headings (H1–H6), bold, italic, inline code, fenced code blocks, paragraphs, links, unordered/ordered lists.
- FR-002: System MUST sanitize the final HTML against an allowlist of tags/attributes; disallow script/style/iframe and event attributes.
- FR-003: Links MUST be normalized to allow only http(s), mailto, and # fragments; all http(s) links MUST have target="_blank" and rel="noopener noreferrer nofollow".
- FR-004: If content cannot be parsed, System MUST fall back to escaped text within paragraphs.
- FR-005: Rendering MUST not mutate or rely on external network calls (fully client-side, deterministic).
- FR-006: Code blocks SHOULD preserve whitespace and be wrapped in <pre><code>; <pre> SHOULD include aria-label="code block".

### Key Entities

- Message (UI): { role: string, create_time?: number, text?: string, hasImage?: boolean }
- RenderedMessage: safe HTML string derived from Message.text via Markdown parser and sanitizer.

## Success Criteria

### Measurable Outcomes

- SC-001: 100% of existing detail view tests continue to pass; new Markdown tests pass.
- SC-002: All unsafe inputs (script tags, javascript: links) are removed in DOM-based inspection tests.
- SC-003: Typical Markdown samples render in under 16ms per message on a mid-range laptop (manual spot check; non-blocking NFR).
- SC-004: No external resources are fetched as part of rendering (verified by code inspection and spot testing).
