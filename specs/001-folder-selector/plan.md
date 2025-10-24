# Implementation Plan: Folder Selector (Choose Chat Export Folder)

Created: 2025-10-25
Status: Ready
Source Spec: specs/001-folder-selector/spec.md

## Overview
Client-only UI to select a local ChatGPT export folder and locate required files (at minimum `conversations.json`). Provide clear status, error handling, and persist minimal recent context locally. No servers, no databases.

## Architecture
- Single-page app (vanilla HTML/CSS/JS)
- Modules
  - `ui/header.js` (MagTech.ai logo + title, responsive)
  - `features/folder/selectFolder.js` (directory/file selection logic)
  - `data/files/listing.js` (normalize directory entries from input directory picker or multi-file selection)
  - `data/conversations/loadConversationsFile.js` (find and read `conversations.json`)
  - `state/appState.js` (ephemeral state; persist small bits to `localStorage`)
  - `utils/errors.js`, `utils/dom.js`
- Optional capability: File System Access API when available; fallback to `<input type="file" webkitdirectory>` or multi-file selection

## Data Model
- ExtractFolder: { name, fileCount, hasConversationsJson }
- ConversationsFile: { path, sizeBytes, lastModified }
- AppState: { extractFolderName, conversationsPath? }

## UX & Accessibility
- Primary CTA: "Select Export Folder"; shows selected folder name and basic stats
- If folder picking unsupported, show file picker for `conversations.json`
- Errors are announced via ARIA live region; focus management returns to picker button on error
- Responsive header with MagTech.ai logo (local asset)

## Constitution Gate Check
- Client-side only: PASS
- Minimal dependencies: PASS (no external libs)
- Tests required: PASS (in-browser test harness)
- File-based data: PASS
- Browser compatibility: PASS with graceful fallback
- UI & Branding: PASS (responsive + MagTech.ai logo)

## Phases
1) Scaffolding: HTML shell, header, logo asset wiring
2) Folder selection capability with fallbacks
3) Locate and validate `conversations.json`; surface status/errors
4) Persist minimal context to `localStorage`; emit event for downstream features
5) Tests and hardening (empty/malformed/missing)

## Test Plan
- Unit: file listing normalization; conversations file detection; error mapping
- Integration: pick a sample folder; verify detection of `conversations.json`
- Negative: missing file; unreadable file; malformed JSON

## Risks & Mitigations
- Directory picking unsupported → file picker fallback
- Large folders → filter to required filename before reading
- JSON parse errors → defensive try/catch + user guidance

## Deliverables
- `index.html`, `styles.css`
- JS modules listed above
- `tests/folder-selector/*.spec.js` + `tests/index.html` harness
