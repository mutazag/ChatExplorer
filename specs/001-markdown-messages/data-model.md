# data-model.md — Markdown Messages

**Feature**: 001-markdown-messages  
**Created**: 2025-10-28

## Key Entities

- Message
  - `id` (string): unique identifier
  - `create_time` (number|timestamp): creation time
  - `role` (string): 'user'|'assistant'|'system'
  - `text` (string): original message text (may contain markdown and plain URLs)
  - `media` (array): existing media attachments (unchanged)
  - `renderedHtml` (string): sanitized HTML produced by markdown renderer after auto-linking and sanitizer steps

## Validation Rules

- `text` must be a string; empty string allowed.
- `renderedHtml` must be sanitized HTML and must not contain script tags or unsafe attributes.

## Notes

- No new persistent storage required. `renderedHtml` is generated at display time and may be cached in memory for performance.
# Data Model — Markdown messages

Date: 2025-10-25
Branch: 001-markdown-messages

## Entities

### Message (UI)
- role: string (e.g., user, assistant)
- create_time: number | undefined
- text: string | undefined (raw message content)

### RenderedMessage (derived)
- html: string (sanitized HTML produced from text)

## Validation Rules
- If text is empty/null → render nothing for body (retain role/metadata)
- Links must be normalized to allowed schemes only
- Disallowed tags/attrs removed by sanitizer

## Normalization Rules
- No changes to core conversation normalization beyond ensuring `text` is a string
- Rendering performed at UI layer using Markdown renderer

## Error Handling
- On malformed Markdown → fall back to escaped text in paragraphs
- No external requests are issued during rendering
