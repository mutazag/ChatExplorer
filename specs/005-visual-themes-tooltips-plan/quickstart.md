# Quickstart: Visual Themes – Role Icon Tooltips

This guide explains how to validate the tooltip feature in the browser and run tests.

## Prerequisites
- No build step required; static files only.

## Run locally
1. Open `index.html` in a modern browser.
2. Load the sample dataset from `data/newchat/` if not auto-detected.
3. Select a conversation with both user and assistant messages.
4. Hover or focus the role icon on a message.
   - A tooltip should appear within ~100ms with fields:
     - role, id, contentType, createdTime
     - parentId (if present)
     - modelSlug for assistant
   - Long values (e.g., request_id) appear truncated with middle-ellipsis.
   - Tooltip should be announced via ARIA (aria-describedby) and dismiss on blur/Esc.

## Tests
- Unit tests: add cases under `tests/unit/` for new parsing/meta helpers.
- Integration tests: add cases under `tests/integration/` to simulate focus/hover and assert tooltip DOM.
- Performance: verify tooltip visibility occurs within target thresholds.

## Notes
- All behavior is client-side per constitution; no external services are used.
- Reduced-motion users should see minimal/no animation.
