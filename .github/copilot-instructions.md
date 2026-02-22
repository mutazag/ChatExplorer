# newchatbrowser Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-25

## Active Technologies
- JavaScript (ES6+), HTML5, CSS3 + None (vanilla). Tests: in-browser harness under `tests/`. (001-markdown-messages)
- Local JSON exports; no persistence; static assets only. (001-markdown-messages)
- [e.g., JavaScript ES6+, HTML5 or NEEDS CLARIFICATION] + [e.g., None (vanilla), Mocha (testing only) or NEEDS CLARIFICATION] (001-multimodal-inline)
- [e.g., Local JSON files, Browser File API, Static HTML or NEEDS CLARIFICATION] (001-multimodal-inline)
- JavaScript (ES6+), HTML5, CSS3 + None (vanilla). Tests run in-browser via the existing harness in `tests/`. (001-multimodal-inline)
- Local JSON exports; static assets only; files loaded via relative paths or File API selection. (001-multimodal-inline)
- No persistence; session state only (theme, pane visibility in memory). (001-visual-themes)
- JavaScript (ES6+), HTML5 + None (vanilla JS). Prefer built-in regex-based auto-linking or a small vendored library if justified. (001-markdown-messages)
- No new storage; uses existing in-memory message objects and static `data/` datasets. (001-markdown-messages)
- N/A for runtime changes; app remains JavaScript (ES6+), HTML5, CSS3 + None for app; CD uses GitHub Actions built-ins and `actions/upload-artifact@v4` (001-cd-build-artifacts)
- Static files; artifacts stored in GitHub Actions with 90-day retention (org policy may override) (001-cd-build-artifacts)
- JavaScript (ES6+), HTML5, CSS3 (vanilla) + None (vanilla); tests via in-browser harness under `tests/` (005-visual-themes-tooltips-plan)
- JavaScript (ES6+), HTML5, CSS3 (vanilla) + None for runtime; in-browser test harness under `tests/` (001-fix-mobile-folder-selector)
- Local static files (JSON/HTML) via Browser File API and relative paths (001-fix-mobile-folder-selector)

- JavaScript (ES6+), HTML5, CSS3 + None (vanilla). Tests: existing in-browser harness. (001-multimodal-inline)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

JavaScript (ES6+), HTML5, CSS3: Follow standard conventions

## Recent Changes
- 001-fix-mobile-folder-selector: Added JavaScript (ES6+), HTML5, CSS3 (vanilla) + None for runtime; in-browser test harness under `tests/`
- 005-visual-themes-tooltips-plan: Added JavaScript (ES6+), HTML5, CSS3 (vanilla) + None (vanilla); tests via in-browser harness under `tests/`
- 001-cd-build-artifacts: Added N/A for runtime changes; app remains JavaScript (ES6+), HTML5, CSS3 + None for app; CD uses GitHub Actions built-ins and `actions/upload-artifact@v4`

# slash commands
We're going to be using from .github/prompts
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
