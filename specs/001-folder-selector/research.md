# Research: Dataset List Icon and Time Label

Date: 2025-10-25

## Goal
Enhance the datasets list under `/data/` to display a folder icon and a time label for each folder using available metadata, while keeping the app client-only and not introducing a datasets.json manifest.

## Unknowns and Decisions

1) What metadata is reliably available client-side for a static site?
	- Decision: Use HTTP `Last-Modified` response header from `<path>/conversations.json` (via HEAD request) as primary time source.
	- Rationale: Cheap, standardized, broadly available in static servers.
	- Alternatives considered: Parse directory index columns (not guaranteed format); compute from conversations JSON after load (costly upfront, but feasible as a fallback).

2) How to get the list of folders without a manifest?
	- Decision: Parse the static server directory index HTML for `/data/` when available.
	- Rationale: Works with many dev servers; zero additional infra.
	- Alternative: Generated fallback list (code, not runtime manifest) — deferred unless needed.

3) Icon choice and delivery?
	- Decision: Use a local inline SVG (folder) or an `assets/folder.svg` with relative reference.
	- Rationale: Meets constitution (no external assets), simple, cacheable.

4) Accessibility and formatting?
	- Decision: Provide an accessible name including folder name and time; display human-friendly relative or short-date format.
	- Rationale: Improves UX and meets basic a11y expectations.

## Selected Approach

- Discover candidates by parsing `/data/` directory index; validate via `HEAD`/`GET` probe to `<path>/conversations.json`.
- Fetch `Last-Modified` from the probe response and store as `modifiedAt` for display.
- Fallbacks:
  - If `Last-Modified` missing: attempt to parse date from directory index if present.
  - If still unknown: display “Unknown” initially; once a dataset is loaded, compute a time from conversations (e.g., latest message time) and cache it in state.
- Display a folder icon (inline SVG or `assets/folder.svg`) before the label.

## Risks

- Missing/incorrect `Last-Modified`: mitigated by fallbacks.
- Directory index unavailable: mitigated by showing empty-state and legacy picker; optionally add a generated fallback later.
- Time zone inconsistencies: format to local time or use relative time; clearly label.

## Out of Scope

- Server-side middleware to provide directory JSON listings.
- Full localization; we will use a simple locale-aware short date for now.

