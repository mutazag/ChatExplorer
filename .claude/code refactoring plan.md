# ChatExplorer Refactoring Plan

## Context

This plan captures the prioritised refactoring work identified during a full codebase review of ChatExplorer (NewChatBrowser) — a zero-dependency, client-side web application for browsing ChatGPT conversation exports. The review identified a set of structural, quality, and performance issues that compound over time without changing the project's core constraints (vanilla JS, no build step, no runtime dependencies). This document is the implementation guide for those changes, ordered by priority.

---

## Constraints (must not change)

- No runtime framework or library dependencies
- No build step (no Vite, Webpack, etc.)
- No server-side logic
- Puppeteer + in-browser harness remain the test infrastructure
- CSS custom properties + single stylesheet approach preserved

---

## Execution Order

Work should be executed in the order listed. HIGH items unblock or de-risk MEDIUM items. Each item is a self-contained change with its own branch (`[###-feature-name]` convention).

| ID | Title | Priority | Branch suggestion |
|----|-------|----------|-------------------|
| H1 | Break up `detailView.js` | HIGH | `001-refactor-detail-view` |
| H2 | Eliminate `window.*` globals | HIGH | `002-module-exports` |
| H3 | Coverage instrumentation in CI | HIGH | `003-coverage-ci` |
| M6 | Runner consistency (Puppeteer canonical) | HIGH | `004-test-runner-consistency` |
| H4 | Fix z-index conflicts | HIGH | `005-zindex-scale` |
| M1 | CSS class string constants module | MEDIUM | `006-css-constants` |
| M2 | Extend markdown renderer | MEDIUM | `007-markdown-extensions` |
| M3 | Consolidate dataset loading | MEDIUM | `008-data-loader` |
| M4 | localStorage state persistence | MEDIUM | `009-state-persistence` |
| M5 | Surface silent catch blocks | MEDIUM | `010-error-surfacing` |
| M7-P1 | In-memory cache + timing instrumentation | MEDIUM | `011-dataset-cache-p1` |
| L1 | RTL detection improvement | LOW | `012-rtl-detection` |
| L2/M7-P4 | SessionStorage index cache | LOW | `013-session-cache` |
| L3 | Clarify/absorb `events.js` | LOW | `014-events-bridge` |
| M7-P2 | Bounded parallel crawl | LOW | `015-parallel-crawl` |
| M7-P3 | Optional asset-index manifest | LOW | `016-asset-manifest` |

---

## HIGH Priority

---

### H1 — Break up `detailView.js`

**Problem:** `src/ui/detailView.js` violates single responsibility — it handles message rendering, media element construction, tooltip wiring, mobile dropdown, and timestamp formatting. Every new feature added to the detail pane increases complexity multiplicatively.

**Files affected:**
- `src/ui/detailView.js` (primary — decompose this)
- `src/ui/messageRenderer.js` (new)
- `src/ui/mediaRenderer.js` (new)
- `src/ui/detailHeader.js` (new)
- `src/app.js` (update import if needed)

**Implementation steps:**

1. **Read `detailView.js` in full** before touching anything. Map every function and DOM construction block to one of four responsibilities:
   - Message bubble construction (role logic, text, markdown render, timestamps)
   - Media element construction (image/audio/video, fallback links, lightbox wiring)
   - Header / mobile dropdown (conversation title, mobile `<select>` picker)
   - Orchestration (iterate messages, append to container, handle selection events)

2. **Create `src/ui/messageRenderer.js`**
   - Exports a single function: `renderMessage(message, options) → HTMLElement`
   - Owns: bubble creation, role class assignment, `dir="auto"` + RTL detection, markdown rendering, timestamp element, `data-lightbox` wiring on text links
   - Depends on: `src/utils/markdown.js`, `src/utils/time.js`, `src/utils/a11y.js`
   - Does NOT touch media construction or tooltip creation

3. **Create `src/ui/mediaRenderer.js`**
   - Exports: `renderMediaItems(mediaArray, role) → HTMLElement` (returns a `msg-media` div or null if empty)
   - Owns: image `<img>` with lazy loading and onerror fallback, `<audio>` with aria-label, `<video>` with playsInline, expand button (`⤢`) with keyboard handler, safe URL validation via `mediaResolver`
   - Depends on: `src/utils/media.js`, `src/utils/mediaResolver.js`, `src/utils/a11y.js`

4. **Create `src/ui/detailHeader.js`**
   - Exports: `renderDetailHeader(conversations, selectedId, onSelect) → HTMLElement`
   - Owns: the mobile `<select>` dropdown (`.mobile-list`), sticky positioning, hash-change wiring
   - Only rendered on mobile (caller checks viewport or always renders; CSS hides on desktop)

5. **Reduce `detailView.js` to orchestration only**
   - `renderDetail(host, conversation, conversations)` iterates messages, calls `renderMessage` + `renderMediaItems` per message, prepends header from `renderDetailHeader`
   - No DOM element construction inline — only assembly and event delegation
   - Tooltip wiring (`tooltip.js`) stays in `detailView.js` as it spans the rendered output

6. **Verify no regressions** by running the existing browser tests after each sub-step. Do not merge until all tests pass.

**Acceptance criteria:**
- `detailView.js` contains no inline `createElement` calls for message bubbles or media elements
- Each new module has corresponding unit tests in `tests/unit/`
- Existing integration and visual-theme tests pass unchanged

---

### H2 — Eliminate `window.*` globals from the ES module graph

**Problem:** Five modules assign themselves to `window.*` rather than using ES module exports. This makes dependencies invisible to static analysis, creates implicit load-order requirements, and blocks any future tooling adoption.

**Affected globals:**
- `window.imageLightbox` → `src/ui/imageLightbox.js`
- `window.imagePanZoom` → `src/modules/imagePanZoom.js`
- `window.imageLightboxState` → `src/modules/imageLightboxState.js`
- `window.a11y` → `src/utils/a11y.js`
- `window.mediaResolver` → `src/utils/mediaResolver.js`

**Files affected:**
- All five modules above (add named exports)
- Every consumer of those globals (find with `grep -r "window\." src/`)
- `src/app.js` (initialization order may need explicit sequencing)
- `index.html` (remove any inline script tags that rely on load order)

**Implementation steps:**

1. **Audit consumers first.** For each `window.X` global, find every call site:
   ```
   grep -r "window\.imageLightbox" src/
   grep -r "window\.imagePanZoom" src/
   grep -r "window\.imageLightboxState" src/
   grep -r "window\.a11y" src/
   grep -r "window\.mediaResolver" src/
   ```

2. **For each module, add named exports** without removing the `window.*` assignment yet:
   ```js
   // Before (IIFE or side-effect assignment):
   window.a11y = { trapFocus, restoreFocus, setAriaLabel };

   // After (add export, keep window.* temporarily):
   export { trapFocus, restoreFocus, setAriaLabel };
   window.a11y = { trapFocus, restoreFocus, setAriaLabel }; // remove in step 4
   ```

3. **Update each consumer** to import the named export instead of reading from `window.*`. Do one module at a time. Run tests after each.

4. **Remove `window.*` assignments** from each module once all consumers are migrated and tests pass.

5. **Create `src/bootstrap.js`** — a single ordered initializer that explicitly imports all modules that previously relied on implicit window load order:
   ```js
   // src/bootstrap.js
   import './utils/a11y.js';
   import './utils/mediaResolver.js';
   import './modules/imageLightboxState.js';
   import './modules/imagePanZoom.js';
   import './ui/imageLightbox.js';
   // ... any other side-effect-only imports
   ```
   Import `bootstrap.js` at the top of `src/app.js`.

**Acceptance criteria:**
- `grep -r "window\." src/` returns zero results for the five listed globals
- All browser tests pass
- No implicit load-order dependency remains in `index.html`

---

### H3 — Coverage instrumentation in CI

**Problem:** The constitution mandates 100% test coverage, but CI has no coverage measurement. The mandate is aspirational without enforcement.

**Files affected:**
- `.github/workflows/browser-tests.yml`
- `.github/scripts/run_browser_tests.js`
- `README.md` (update developer docs)

**Implementation steps:**

1. **Evaluate c8 for coverage** — `c8` wraps Node processes and uses V8's built-in coverage. Since Puppeteer drives a real browser (not Node), the approach is slightly different:
   - Use the [Chrome DevTools Protocol Coverage API](https://chromedevtools.github.io/devtools-protocol/tot/Profiler/) via Puppeteer's `page.coverage.startJSCoverage()` / `stopJSCoverage()`
   - This gives per-file covered byte ranges for all loaded JS
   - Post-process coverage output into Istanbul-compatible JSON (`v8-to-istanbul` package, dev-only)

2. **Update `run_browser_tests.js`** to:
   ```js
   await page.coverage.startJSCoverage();
   // ... run tests ...
   const coverage = await page.coverage.stopJSCoverage();
   // write coverage to coverage/coverage.json
   ```

3. **Add `v8-to-istanbul` as a dev dependency** (CI-only, not runtime):
   ```yaml
   # browser-tests.yml
   - run: npm install puppeteer v8-to-istanbul
   ```

4. **Add a coverage threshold check** to the CI step — fail the build if any source file drops below the threshold:
   ```yaml
   - run: node .github/scripts/check_coverage.js --threshold 80
   ```
   Start at 80% to establish a baseline, then raise to 100% once gaps are identified and filled.

5. **Output coverage summary** to the GitHub Actions job summary (similar to the existing CD artifact summary).

**Acceptance criteria:**
- CI fails if coverage drops below threshold
- Coverage report is available as a workflow artifact
- `README.md` documents how to view coverage locally

---

### M6 — Runner consistency (Puppeteer canonical)

**Problem:** CI uses Puppeteer (`run_browser_tests.js`); the local script `scripts/run-harnesses.js` requires Playwright and silently fails if not installed. "Green CI + can't run locally" can coexist.

**Files affected:**
- `scripts/run-harnesses.js` (replace with Puppeteer version)
- `.github/scripts/run_browser_tests.js` (align path/interface)
- `.github/workflows/browser-tests.yml` (verify it calls the canonical script)
- `README.md` (update to single test command)
- Rename Playwright script if keeping for perf: `scripts/test-perf-playwright.js`

**Implementation steps:**

1. **Audit both scripts** side-by-side before touching anything:
   - What test files does each script load?
   - What assertions does each run?
   - Are there scenarios covered by one but not the other?
   - Document any gaps as new test cases to be written.

2. **Define the canonical entry point:** `scripts/test-browser.js`
   - Copy the working Puppeteer logic from `.github/scripts/run_browser_tests.js`
   - Add: configurable port (env var `TEST_PORT`, default `8080`)
   - Add: standardized output format — each failed test on its own line with test name + stack
   - Add: non-zero exit code on any failure (verify this is already true)

3. **Update CI** (`browser-tests.yml`) to call `node scripts/test-browser.js` instead of `.github/scripts/run_browser_tests.js`

4. **Remove `scripts/run-harnesses.js`** (or if it covers unique perf scenarios, rename to `scripts/test-perf-playwright.js` and add a comment: _"Optional. Requires Playwright. Not run in CI."_)

5. **Update `README.md`:**
   ```
   ## Running Tests
   npx http-server . -p 8080 &
   node scripts/test-browser.js
   ```

6. **Verify locally** that `node scripts/test-browser.js` produces the same pass/fail as CI.

**Acceptance criteria:**
- One documented command runs the full test suite locally and in CI
- CI calls the same script path as local
- A contributor with only Puppeteer installed can run all gating tests
- Playwright dependency is optional and non-gating

---

### H4 — Fix z-index conflict between tooltip and lightbox

**Problem:** `tooltip.js` and `imageLightbox.js` both hardcode `z-index: 9999`. Rendering order is browser-dependent.

**Files affected:**
- `styles.css` (add z-index custom properties)
- `src/ui/imageLightbox.css` (use variable)
- `src/ui/tooltip.js` (use variable or rely on CSS class)
- Any inline style setting z-index in `imageLightbox.js`

**Implementation steps:**

1. Add a z-index scale to `:root` in `styles.css`:
   ```css
   :root {
     --z-tooltip: 100;
     --z-lightbox-overlay: 300;
     --z-lightbox-content: 310;
   }
   ```

2. Replace hardcoded `z-index: 9999` in `styles.css` tooltip rules with `var(--z-tooltip)`.

3. Replace hardcoded values in `imageLightbox.css` with `var(--z-lightbox-overlay)` and `var(--z-lightbox-content)`.

4. Search for any inline `style.zIndex` assignments in JS files and replace with the CSS variable approach (set a class that applies the variable, rather than inline styles).

5. Verify: open a conversation, hover a role icon to show tooltip, then open the lightbox — tooltip must not appear above the lightbox overlay.

**Acceptance criteria:**
- No hardcoded `z-index` values remain in CSS or JS for these components
- Lightbox always renders above tooltip
- Tooltip renders above normal page content

---

## MEDIUM Priority

---

### M1 — CSS class string constants module

**Problem:** CSS class names are hardcoded as string literals in JS (e.g. `'image-lightbox__img'`, `'bubble--media-only'`, `'msg--user'`). Renaming a class requires grep-and-replace with no safety net.

**Files affected:**
- `src/constants/cssClasses.js` (new)
- All JS files that reference CSS class strings (audit with grep)

**Implementation steps:**

1. Create `src/constants/cssClasses.js`:
   ```js
   export const CSS = {
     // Bubbles
     BUBBLE: 'bubble',
     BUBBLE_MEDIA_ONLY: 'bubble--media-only',
     MSG_USER: 'msg--user',
     MSG_ASSISTANT: 'msg--assistant',
     // Lightbox
     LIGHTBOX_IMG: 'image-lightbox__img',
     LIGHTBOX_OVERLAY: 'image-lightbox',
     // Mobile
     MOBILE_LIST: 'mobile-list',
     SHOW_LEFT: 'show-left',
     // Tooltips
     TOOLTIP: 'tooltip',
     TOOLTIP_VISIBLE: 'tooltip--visible',
     // Add others as discovered
   };
   ```

2. Find all hardcoded class string literals in `src/`:
   ```
   grep -rn "classList\|className\|getAttribute.*class" src/
   ```

3. Replace each literal with the corresponding `CSS.*` constant. Import `CSS` at the top of each file that needs it.

4. Do not change CSS files — only the JS references.

**Acceptance criteria:**
- No string literals matching CSS class names remain in `src/` JS files
- `src/constants/cssClasses.js` is the single source of truth for all JS-referenced class names
- All browser tests pass

---

### M2 — Extend the markdown renderer

**Problem:** `src/utils/markdown.js` is missing common patterns that appear in ChatGPT exports: tables, blockquotes, strikethrough, and task lists. This degrades the core reading experience.

**Files affected:**
- `src/utils/markdown.js`
- `tests/unit/markdown.test.js` (new or extend existing)
- `styles.css` (add table and blockquote styles)

**Implementation steps:**

1. **Read `markdown.js` in full** to understand the existing pattern-matching pipeline before adding to it.

2. **Add patterns in this order** (additive, not replacing anything):

   a. **Blockquotes** — lines starting with `> `:
   ```
   > This is a quote
   ```
   → `<blockquote><p>This is a quote</p></blockquote>`

   b. **Strikethrough** — `~~text~~`:
   → `<del>text</del>`

   c. **Task lists** — `- [ ] item` and `- [x] item`:
   → `<li class="task-item"><input type="checkbox" disabled> item</li>`
   → Note: `disabled` is required (read-only viewer)

   d. **Tables** — GFM pipe syntax:
   ```
   | Col A | Col B |
   |-------|-------|
   | val   | val   |
   ```
   → `<table><thead>...</thead><tbody>...</tbody></table>`
   → Add `overflow-x: auto` wrapper for mobile

3. **Write tests first** for each new pattern (TDD per constitution):
   - Input string → expected HTML output
   - Edge cases: empty cells, nested inline formatting in cells, blockquotes containing bold text

4. **Add CSS** for new elements in `styles.css`:
   ```css
   blockquote { border-left: 3px solid var(--border); padding-left: 1rem; margin: 0.5rem 0; color: var(--muted); }
   table { border-collapse: collapse; width: 100%; overflow-x: auto; display: block; }
   th, td { border: 1px solid var(--border); padding: 0.4rem 0.8rem; text-align: left; }
   .task-item input[type="checkbox"] { margin-right: 0.4rem; }
   del { color: var(--muted); }
   ```

**Acceptance criteria:**
- All four new patterns render correctly in conversation view
- Existing markdown tests continue to pass
- New tests cover happy path and edge cases for each pattern
- Mobile table overflow handled with horizontal scroll

---

### M3 — Consolidate dataset loading out of `app.js`

**Problem:** HTTP discovery logic is embedded in `app.js` alongside UI wiring. `dataSelection.js` and `selectFolder.js` have overlapping responsibilities. The two loading paths (file picker vs HTTP) are not co-located.

**Files affected:**
- `src/data/dataLoader.js` (new)
- `src/app.js` (remove embedded discovery, import dataLoader)
- `src/modules/dataSelection.js` (review for absorption)
- `src/features/folder/selectFolder.js` (review for absorption)
- `src/data/datasets/discovery.js` (consumed by dataLoader)

**Implementation steps:**

1. **Read `app.js`, `dataSelection.js`, `selectFolder.js`, and `discovery.js` in full** to map exactly which functions belong to "loading data" vs "updating UI/state".

2. **Create `src/data/dataLoader.js`** that owns both loading paths:
   ```js
   // src/data/dataLoader.js
   export async function loadFromFilePicker(fileList) { ... }
   export async function loadFromHttpDiscovery(dataPath) { ... }
   export async function loadConversations(source) { ... } // unified entry
   ```
   - Move HTTP fetch + directory probe logic from `app.js` into `loadFromHttpDiscovery`
   - Move file-picker loading from `selectFolder.js` into `loadFromFilePicker`
   - Both paths return the same shape: `{ conversations, stats, assetIndex }`

3. **Reduce `app.js`** to: import `dataLoader`, call `loadConversations`, pass result to `setConversations()`. No fetch/HTTP logic remains in `app.js`.

4. **Review `dataSelection.js`** — if it is only glue between old paths, absorb it into `dataLoader.js` and delete it. If it owns UI-specific logic (e.g. rendering dataset choices), keep it but rename to `src/ui/datasetChooser.js`.

**Acceptance criteria:**
- All data-loading logic lives in `src/data/`
- `app.js` contains no `fetch()` calls
- Both loading paths (file picker and HTTP) remain functional
- Existing tests pass

---

### M4 — localStorage persistence for theme and pane state

**Problem:** Theme preference and left-pane visibility reset on every page reload — minor but persistent UX friction.

**Files affected:**
- `src/state/appState.js`
- `src/ui/controls.js` (theme toggle reads initial state)

**Implementation steps:**

1. Add a persistence layer to `appState.js` — three small functions:
   ```js
   const STORAGE_KEYS = { theme: 'ce_theme', pane: 'ce_pane' };

   function loadPersistedState() {
     return {
       theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light',
       leftPaneVisible: localStorage.getItem(STORAGE_KEYS.pane) !== 'false',
     };
   }

   function persistTheme(theme) { localStorage.setItem(STORAGE_KEYS.theme, theme); }
   function persistPane(visible) { localStorage.setItem(STORAGE_KEYS.pane, String(visible)); }
   ```

2. Call `loadPersistedState()` during `appState` initialisation to seed `theme` and `leftPaneVisible` from storage.

3. In `setTheme()` and `setLeftPaneVisible()`, call the corresponding persist function after updating state.

4. In `src/ui/controls.js`, ensure the theme toggle button `aria-pressed` state reflects the loaded theme on init (it likely already reads from `appState.getState()` — verify).

5. Test: set dark theme, reload page, verify dark theme is applied before first render (no flash of light theme). Test with localStorage cleared to verify defaults.

**Acceptance criteria:**
- Theme persists across page reloads
- Pane visibility persists across page reloads
- `localStorage` is used for exactly two keys
- Clearing localStorage restores defaults (light theme, left pane visible)

---

### M5 — Surface silent catch blocks

**Problem:** Silent `catch` blocks give users no signal when something fails (missing file, malformed JSON, network error).

**Files affected:**
- `src/data/datasets/discovery.js`
- `src/data/conversations/loadConversationsFile.js`
- `src/data/conversations/parse.js`
- `src/utils/assetIndex.js`
- `src/app.js`
- Any other file with a bare `catch` — audit with: `grep -n "catch" src/**/*.js`

**Implementation steps:**

1. **Audit all catch blocks** across `src/`. Categorise each:
   - **Expected/benign** (e.g. file not found during probe) — keep silent but add `// intentionally silent: <reason>` comment
   - **Unexpected/user-impacting** — must surface

2. For unexpected errors, define two levels:
   - **Console warning** (non-blocking): `console.warn('[ChatExplorer] context:', err)`
   - **UI error state** (blocking): call a new `src/state/appState.setError(message)` setter that:
     - Stores `{ message, detail }` in state
     - Emits `error:occurred` event
     - The existing `aria-live="polite"` error region in `app.js` (line ~30) reads this state and displays the message

3. Specific cases to handle:
   - `conversations.json` fetch fails → show "Could not load conversations. Check that the file exists." in error region
   - JSON parse failure → show "conversations.json could not be parsed. The export may be corrupted."
   - Asset index build failure → `console.warn` (non-blocking, graceful degradation to download links)
   - Dataset discovery HTTP errors → show "No datasets found. Check the data/ folder."

**Acceptance criteria:**
- Zero bare `catch (e) {}` blocks remain in `src/`
- All intentionally silent catches have a comment explaining why
- Users see a meaningful message for the three named failure scenarios
- Existing tests pass; add tests for error state propagation

---

### M7-P1 — In-memory cache + timing instrumentation

**Problem:** Each dataset switch re-runs full discovery, file listing, and normalization. For large exports this adds latency; for the same dataset loaded twice it is pure waste.

**Files affected:**
- `src/data/dataLoader.js` (after M3; or `discovery.js` / `loadConversationsFile.js` if M3 not done first)
- `src/utils/perfTimer.js` (new — lightweight timing utility)

**Implementation steps:**

1. **Create `src/utils/perfTimer.js`** — a tiny timing utility:
   ```js
   export function startTimer(label) {
     const t = performance.now();
     return () => console.debug(`[perf] ${label}: ${(performance.now() - t).toFixed(1)}ms`);
   }
   ```

2. **Instrument the four stages** in the loading pipeline:
   - Dataset discovery / file listing
   - `conversations.json` fetch
   - `normalizeConversationsWithWarnings()` in `parse.js`
   - Asset index build in `assetIndex.js`

   Each stage wraps with `const stop = startTimer('label'); ... stop();`

3. **Add in-memory cache** keyed by `datasetPath`:
   ```js
   const _cache = new Map(); // key: datasetPath, value: { conversations, stats, assetIndex, etag }

   async function loadFromHttpDiscovery(dataPath) {
     const cached = _cache.get(dataPath);
     if (cached) return cached; // skip re-fetch
     // ... load ...
     _cache.set(dataPath, result);
     return result;
   }
   ```

   - Optionally use `ETag` / `Last-Modified` response headers to invalidate:
     ```js
     const res = await fetch(url, { method: 'HEAD' });
     const etag = res.headers.get('ETag');
     if (cached?.etag === etag) return cached;
     ```
   - Cache is in-memory only (cleared on page reload) — no storage API needed in this phase.

4. **Review timing output** on a real large export to determine whether Phase 2 (parallel crawl) is actually warranted.

**Acceptance criteria:**
- Console shows per-stage timing for every dataset load
- Second load of the same dataset returns cached result with near-zero latency (verify in console)
- No regression in pointer resolution accuracy
- Timings are emitted at `console.debug` level (not visible in production unless DevTools open)

---

## LOW Priority

---

### L1 — RTL detection improvement

**Problem:** `isProbablyRtl()` in `detailView.js` uses character-range scanning which fails on mixed Arabic/English text.

**Files affected:**
- `src/ui/messageRenderer.js` (after H1) or `src/ui/detailView.js`

**Implementation steps:**

1. Replace the character-range check with a heuristic using `Intl.Segmenter` (where available) or a Unicode bidi category count:
   ```js
   function isProbablyRtl(text) {
     if (!text) return false;
     const rtlChars = (text.match(/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/g) || []).length;
     const ltrChars = (text.match(/[A-Za-z\u00C0-\u024F]/g) || []).length;
     return rtlChars > ltrChars;
   }
   ```
2. Keep `dir="auto"` on all bubble elements as a safety net (browser bidi algorithm handles word-level direction regardless).

**Acceptance criteria:**
- Mixed Arabic/English conversations display with correct paragraph-level direction
- LTR conversations unaffected

---

### L2/M7-P4 — SessionStorage index cache

**Problem:** Page reload discards all loaded data.

**Files affected:**
- `src/data/dataLoader.js`

**Implementation steps:**

1. After loading and normalizing conversations, serialize only the **index structures** (not raw payloads) to sessionStorage:
   - Conversation list (id, title, update_time, message count) — not full message content
   - Asset index map (pointer → relative path)

2. Add a version key (e.g. `ce_cache_v1`) to invalidate stale cache when data structures change.

3. On app init, check sessionStorage for cached index. If present and version matches, skip discovery/loading.

4. Bound the cache: if serialized size exceeds 2MB, skip caching (large exports would bloat sessionStorage).

**Acceptance criteria:**
- Page reload within same tab reuses cached index without re-fetching
- Cache is invalidated when version key changes
- Large exports (>2MB serialized) fall back to normal load without error

---

### L3 — Clarify or absorb `events.js`

**Problem:** `src/state/events.js` bridge module's purpose is ambiguous.

**Files affected:**
- `src/state/events.js`
- `src/state/appState.js`
- Any consumers of `events.js`

**Implementation steps:**

1. Read `events.js` and every file that imports it.
2. If it is only re-emitting `appState` events — absorb its exports into `appState.js` and delete `events.js`.
3. If it provides real decoupling (e.g. allows external code to trigger state changes without importing `appState`) — add a JSDoc comment explaining this and export an explicit interface.

**Acceptance criteria:**
- `events.js` either no longer exists or has a clear documented purpose
- No consumers break

---

### M7-P2 — Bounded parallel crawl

> **Prerequisite:** Complete M7-P1 and review timing output. Only proceed if instrumentation confirms crawl time is a measurable bottleneck.

**Files affected:**
- `src/data/datasets/discovery.js`

**Implementation steps:**

1. Replace sequential recursive directory traversal with a bounded concurrent queue:
   ```js
   async function crawlWithConcurrency(paths, maxConcurrency = 4) {
     const results = [];
     const queue = [...paths];
     const workers = Array(Math.min(maxConcurrency, queue.length)).fill(null).map(async () => {
       while (queue.length) {
         const path = queue.shift();
         const children = await probePath(path);
         queue.push(...children);
         results.push(...children);
       }
     });
     await Promise.all(workers);
     return results;
   }
   ```

2. Make `maxDepth` configurable: default `2` (current), but accept `deep` mode (`4`) when unresolved pointer ratio exceeds a threshold (e.g. >20% unresolved after shallow crawl).

3. Add early termination: stop crawling when all known pointer prefixes are resolved.

**Acceptance criteria:**
- Crawl time measurably reduced on datasets with many subdirectories
- Pointer resolution accuracy unchanged
- `maxConcurrency` is a named constant, not a magic number

---

### M7-P3 — Optional asset-index manifest

> **Prerequisite:** Confirm with project owner that generating `asset-index.json` does not conflict with the no-build-step constraint. This item requires a companion generator script.

**Files affected:**
- `src/utils/assetIndex.js`
- `scripts/generate-asset-index.mjs` (new — developer utility, not part of runtime)
- `README.md` (document optional manifest generation)

**Implementation steps:**

1. Define the manifest schema:
   ```json
   {
     "version": 1,
     "generated": "<ISO timestamp>",
     "entries": {
       "file-<ID>": "relative/path/to/file.jpg"
     }
   }
   ```

2. In `assetIndex.js`, check for `data/<dataset>/asset-index.json` before running the crawler:
   ```js
   async function buildAssetIndex(datasetPath, fileList) {
     const manifest = await tryLoadManifest(datasetPath);
     if (manifest) return manifest;
     return crawlAndBuild(datasetPath, fileList);
   }
   ```

3. Create `scripts/generate-asset-index.mjs` — a Node.js script (dev-time only) that walks a dataset directory and writes `asset-index.json`.

4. Document in `README.md` under a "Performance" section — optional step for large datasets.

**Acceptance criteria:**
- App functions correctly with and without manifest present
- Manifest presence reduces asset index build time to near-zero
- Manifest absence triggers normal crawl (no error)
- Generator script is not part of the CI/CD pipeline

---

## Verification Checklist (end-to-end)

After completing all HIGH items, run the following verification:

```
# 1. Start local server
npx http-server . -p 8080

# 2. Run canonical test suite (M6 must be done)
node scripts/test-browser.js

# 3. Open browser and manually verify:
#    - Load a dataset with images, audio, and video
#    - Verify all media renders inline
#    - Open image in lightbox, verify tooltip does not appear above it (H4)
#    - Toggle theme; reload page; verify theme persists (M4)
#    - Toggle pane; reload; verify pane state persists (M4)
#    - Open DevTools console; switch datasets; verify per-stage timing output (M7-P1)
#    - Disconnect network; reload; verify cached index used (L2/M7-P4)
#    - Resize to mobile (<860px); verify header reflow and dropdown work
#    - Keyboard-navigate conversation list; verify arrow key + Enter works
#    - Open role icon tooltip; open lightbox; verify lightbox renders above tooltip (H4)

# 4. CI verification
#    Push branch to GitHub; verify browser-tests.yml goes green
#    Verify coverage report appears as CI artifact (H3)
```

---

## Notes for Implementors

- Each item is a separate feature branch following the `[###-feature-name]` convention
- Write failing tests before implementation (TDD per constitution)
- Do not merge a branch until all browser tests pass in CI
- The order in the Execution Order table is a recommended sequence — H1 and H2 are prerequisites for several MEDIUM items (H1 creates `messageRenderer.js` and `mediaRenderer.js` which M1 and M2 will update; H2 makes the module graph explicit which M3 depends on)
- M3 (consolidate data loading) should be done before M7-P1 and M7-P2 so the cache and crawl improvements land in a clean module
