# Feature Specification: Markdown Messages

**Feature Branch**: `001-markdown-messages`  
**Created**: 2025-10-28  
**Status**: Draft  
**Input**: User description: "feature 001-markdown-messages should include the ability to render any URLs as link to open in a new tab"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clickable links in messages (Priority: P1)

As a user browsing a conversation, I want any URL shown in message text to be rendered as a clickable link so I can open referenced resources in a new browser tab without losing my place in the conversation.

**Why this priority**: Core UX expectation for chat transcripts with external references; high impact on usability.

**Independent Test**: Load a conversation containing plain-text URLs (http, https). Verify that each URL appears as an anchor element, clicking it opens the target in a new browser tab, and the conversation UI remains focused in the original tab.

**Acceptance Scenarios**:

1. **Given** a message containing `https://example.com`, **When** the message renders, **Then** the UI shows an anchor with `href="https://example.com"`, `target="_blank"`, and `rel="noopener noreferrer nofollow"` and clicking opens a new tab.
2. **Given** a message containing multiple URLs, **When** it renders, **Then** all valid URLs are rendered as separate anchors.

---

### User Story 2 - Preserve Markdown links and formatting (Priority: P2)

As a user who writes messages with Markdown links (e.g., `[label](https://site)`), I want those links preserved exactly as authored (label and link), and not double-wrapped by auto-linking logic.

**Why this priority**: Prevents visual and functional regressions for authored content.

**Independent Test**: Render a message containing a Markdown link. Verify the rendered anchor label matches the markdown label and the href is the specified URL. No nested anchors should be produced.

**Acceptance Scenarios**:

1. **Given** a message that contains a Markdown link `[Open](/path)`, **When** rendered, **Then** the output includes a single anchor with label `Open` and href `/path`.

---

### User Story 3 - Safety & sanitization (Priority: P1)

As a security-conscious user, I want any auto-linked URLs to be sanitized so that malicious schemes (for example `javascript:`) are not rendered as navigable links.

**Why this priority**: Security and privacy protection from malicious payloads.

**Independent Test**: Render messages that contain `javascript:alert(1)` or `blob:` or data URLs of non-media types and verify these are not rendered as clickable navigable links; if provided, the UI should show a safe fallback or plain text.

**Acceptance Scenarios**:

1. **Given** a message containing `javascript:alert(1)`, **When** rendered, **Then** it appears as escaped plain text (no anchor) or a non-navigable label, not an anchor with an active href.
2. **Given** a message containing `data:image/png;base64,...`, **When** rendered, **Then** treat according to media rules (image) rather than auto-linking.

---

### Edge Cases

- Long URLs that exceed layout widths should be wrapped or truncated using an accessible visual pattern (e.g., show ellipses but preserve full URL in the title/aria-label).
- URLs inside code blocks or inline code spans must NOT be auto-linked; they should be rendered as code text.
- Internationalized domain names (IDN) and punycode should be supported where browser URL parsing permits.
- Messages with malformed URLs should not produce anchors; instead, render as text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect and render plain-text HTTP and HTTPS URLs found in message text as anchor elements.
- **FR-002**: Anchor elements created from auto-linking MUST include `target="_blank"` and `rel="noopener noreferrer nofollow"` attributes to open in a new tab and prevent opener access.
- **FR-003**: Existing Markdown links (explicit `[label](url)` syntax) MUST be preserved and rendered as authored; auto-linking MUST NOT double-wrap or alter them.
- **FR-004**: Auto-linking MUST NOT convert text inside code blocks or inline code spans into anchors.
- **FR-005**: The auto-linker MUST ignore and NOT create navigable anchors for unsafe schemes such as `javascript:`, `vbscript:`, and other non-http(s) schemes except where handled explicitly by media rules (e.g., `data:image/*`).
- **FR-006**: For each auto-created anchor, the full URL MUST be available as an accessible label (aria-label or title) so screen-reader users can access the complete target even if the visual text is truncated.
- **FR-007**: The rendering pipeline MUST sanitize HTML produced by the Markdown renderer to prevent XSS. The auto-linker MUST integrate with the sanitizer so only safe anchors are injected.
- **FR-008**: The auto-linking process MUST be deterministic and performant: rendering a message should complete within reasonable client-side time (e.g., under 200ms for a standard message on typical hardware). (Assumption: reasonable web app performance expected.)

### Non-functional Requirements

- **NFR-001**: The user experience MUST remain responsive; adding auto-linking must not block the UI thread for perceptible time.
- **NFR-002**: Accessibility must be preserved (WCAG friendly practices): anchors focusable, include aria labels when needed, and visual truncation must not remove discoverability.

### Key Entities *(include if feature involves data)*

- **Message**: existing entity representing a chat message. New attributes/expectations:
  - `text` (string): may contain plain text, markdown, and pointers.
  - `renderedHtml` (string): sanitized HTML produced by the renderer including anchors.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid `http(s)` URLs in rendered test conversations are converted to clickable anchors (except when inside code blocks), verified by an automated rendering test suite.
- **SC-002**: Clicking an auto-linked anchor opens the target in a new tab in 100% of tested browsers and contexts (desktop and mobile browsers), verified by manual and automated browser checks.
- **SC-003**: No `javascript:` or other unsafe schemes are rendered as active anchors in 100% of security tests.
- **SC-004**: Rendering time for a typical message (up to 2KB of text with several URLs) completes under 200ms on an average modern laptop (measured with a small benchmark harness).

## Assumptions

- The app already uses a Markdown-to-HTML renderer and a sanitization step (`renderMarkdownToSafeHtml` exists). This feature will integrate into that pipeline.

## Clarifications

### Session 2025-10-28

- Q: Where should sanitizer updates and auto-link integration be implemented? → A: Option A — update the existing `renderMarkdownToSafeHtml` in `src/utils/markdown.js` (preferred). Reason: `renderMarkdownToSafeHtml` is already in use throughout the UI; centralizing changes there keeps sanitizer logic in one place, reduces refactor risk, and minimizes surface area for regressions.

*Applied effect:* For the purpose of FR-007, the canonical sanitizer is `renderMarkdownToSafeHtml` (located at `src/utils/markdown.js`). Implementation tasks should target that file for allowlist updates and integration of the autolinker post-processing step.
- The app runs in modern browsers (Chrome, Edge, Firefox, Safari) with standard URL parsing behaviors.
- The team prefers conservative security defaults (block unsafe schemes) over permissive auto-linking.

## Acceptance Tests (suggested)

- Test A: Plain `https://example.com` in message body → anchor rendered, target _blank, rel attrs present, opens new tab.
- Test B: Markdown `[label](https://example.com)` → single anchor with label `label`, no double-wrapping.
- Test C: URL inside inline code `` `https://example.com` `` → rendered as code, not an anchor.
- Test D: `javascript:alert(1)` → not rendered as clickable anchor; shows escaped text.
- Test E: Very long URL → visually truncated with full URL as `title`/`aria-label`.

## Notes

- Implementation detail choices (exact auto-link regex/library) are intentionally left out of the spec; use any robust, well-tested auto-link library or implement with a conservative regex, so long as requirements above are met.
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
