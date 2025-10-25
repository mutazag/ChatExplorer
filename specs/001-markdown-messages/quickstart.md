# Quickstart — Markdown messages

This feature renders message content as sanitized Markdown in the detail view.

## Run tests

- Open `tests/index.html` in a modern browser (Chrome/Edge on Windows)
- Verify the Markdown tests under `tests/conversation-browser/detailView.spec.js` pass

## Notes

- Rendering uses a minimal Markdown parser and allowlist sanitizer
- Only http(s), mailto, and # links are enabled; http(s) links open in a new tab with safe rel
- Code blocks receive aria-label="code block" for accessibility

## Edge cases

- Ordered lists with multi-digit numbering (e.g., `10. ten`, `11. eleven`) are parsed correctly and rendered as a single `<ol>` with items in order. A dedicated test covers this behavior.
 - GitHub-flavored Markdown tables (pipe syntax) are supported, including per-column alignment using the separator row (e.g., `:---`, `---:`, `:---:`). Inline formatting inside cells is allowed and sanitized.*** End Patch
