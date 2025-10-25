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
- 001-multimodal-inline: Added JavaScript (ES6+), HTML5, CSS3 + None (vanilla). Tests run in-browser via the existing harness in `tests/`.
- 001-visual-themes: Added JavaScript (ES6+), HTML5, CSS3 + None (vanilla). Tests: in-browser harness under `tests/`.
- master: Added [e.g., JavaScript ES6+, HTML5 or NEEDS CLARIFICATION] + [e.g., None (vanilla), Mocha (testing only) or NEEDS CLARIFICATION]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
