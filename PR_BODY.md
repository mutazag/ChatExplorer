Title: feat(markdown): autolink plain URLs and sanitize Markdown output (001-markdown-messages)

Summary:
- Adds autolinking for plain http(s) URLs in message Markdown while preserving authored Markdown links.
- Centralizes sanitization in `src/utils/markdown.js`: converts placeholder anchors (`data-raw-href`) to real anchors with safe attributes and strips unsafe tags/attributes/schemes.
- Adds URL normalization/truncation helpers and unit tests. Adds a browser-harness CI workflow that runs the tests headless via Puppeteer.

Files of interest:
- `src/utils/markdown.js` — renderMarkdownToSafeHtml: rendering, autolinker integration, sanitizer.
- `src/utils/links.js` — autolinker helper (inserts `data-raw-href`).
- `src/utils/url.js` — normalize/truncate helpers.
- `tests/unit/` — unit tests for autolinker and sanitizer behavior.
- `.github/workflows/browser-tests.yml` and `.github/scripts/run_browser_tests.js` — CI harness for browser tests.

How to test locally:
1) Start a local static server at repo root and open the browser test harness at `http://localhost:8000/tests/index.html`.
   - A simple Python server works: `python -m http.server 8000` (run from repo root).
2) Open the harness in a browser and confirm unit & integration tests pass.
3) Manually exercise `renderMarkdownToSafeHtml(...)` by loading messages in the UI and verifying:
   - Plain http(s) URLs become anchors that open in a new tab (`target="_blank"`) and include `rel="noopener noreferrer nofollow"`.
   - Authored Markdown links are preserved and sanitized.
   - Unsafe schemes (e.g., `javascript:`) are never converted into active anchors.

CI notes:
- The workflow runs the browser harness headless using Puppeteer. The runner includes a compatibility fallback for Puppeteer environments without `page.waitForTimeout`.

Notes for reviewer:
- Focus review on `renderMarkdownToSafeHtml` for sanitizer rules and any potential allowlist gaps.
- If your repo's default branch is `main` instead of `master`, base the PR on `main` when creating it.

Checklist (minimal):
- [ ] Sanity: unit tests for autolinker & sanitizer pass locally.
- [ ] Integration: browser harness tests green in GitHub Actions.
- [ ] Security: verify sanitizer disallows dangerous schemes and strips event handlers.
- [ ] UX: links open in new tab and have safe rel attributes.

Signed-off-by: PR generator
