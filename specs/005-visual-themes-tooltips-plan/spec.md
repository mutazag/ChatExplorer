# Feature Specification: Visual Themes – Role Icon Tooltips (Focused)

Feature Branch: `005-visual-themes-tooltips-plan`
Created: 2025-10-29
Status: Draft
Input: Source spec `/specs/001-visual-themes/spec.md` (User Story 6)

Scope: Implement User Story 6 only — the role icon tooltip with JSON context.

Acceptance Criteria: Use FR-008..FR-012 and SC-007..SC-009 from the source spec as authoritative.

Out of Scope: Non-tooltip stories from Visual Themes; no backend.

Optional Metadata in Tooltip
- When present in the underlying message context, the tooltip MAY include the following optional fields in addition to the core payload:
	- status: string
	- selected_sources: string[]
	- prompt_expansion_predictions: string[]
	- safe_urls: string[] (URLs)
- If these are absent in the source, omit them entirely from the tooltip payload (no empty placeholders).
