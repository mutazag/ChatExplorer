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
