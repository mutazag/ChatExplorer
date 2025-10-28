# quickstart.md — Markdown Messages (developer)

**Feature**: 001-markdown-messages  
**Created**: 2025-10-28

## How to run locally

1. Serve the app from the repository root with a local static server (recommended):

```powershell
npx http-server . -p 8080
# or if installed globally:
http-server . -p 8080
```

2. Open http://localhost:8080 in your browser and select the `001-markdown-messages` branch code locally (the feature is implemented in `src/utils/links.js` and wired into `src/utils/markdown.js`).

3. Run tests in the browser harness under `tests/` after creating unit tests for `autolinkText`.

## How to validate the feature manually

- Open a conversation containing plain URLs (e.g., `https://example.com`) and verify anchors are clickable, open in a new tab, and include `rel="noopener noreferrer nofollow"`.
- Validate that Markdown links are preserved and code spans are not auto-linked.
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
