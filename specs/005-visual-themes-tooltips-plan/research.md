# Research: Visual Themes – Role Icon Tooltips

Date: 2025-10-29
Scope: Implement User Story 6 (tooltips) from `/specs/001-visual-themes/spec.md`

## Topics and Decisions

- Decision: Deterministic mapping via nodeId
  - Rationale: FR-012 and SC-008 require exact JSON node traceability; include `meta.nodeId` from mapping key.
  - Alternatives: Re-derive from message.id only (insufficient when IDs repeat across branches).

- Decision: Parent id source
  - Rationale: Prefer `mapping[nodeId].parent`; fallback to `message.metadata.parent_id` if present.
  - Alternatives: Omit parent; rejected due to acceptance scenario coverage.

- Decision: Model slug resolution
  - Rationale: Use `message.metadata.model_slug || message.metadata.default_model_slug` for assistant.
  - Alternatives: Only `model_slug`; rejected (incomplete for some records).

- Decision: Content type exposure
  - Rationale: Use `message.content.content_type` verbatim so UI can display and test mapping determinism.

- Decision: Time formatting
  - Rationale: Use existing utils/time formatting; handle epoch seconds gracefully.
  - Alternatives: Intl.DateTimeFormat custom options; can be added later if needed.

- Decision: Truncation strategy
  - Rationale: Middle-ellipsis at 40 characters (configurable); keeps leading/trailing context.
  - Alternatives: Tail-ellipsis; rejected as it hides suffix which often contains uniqueness.

- Decision: Tooltip placement
  - Rationale: Default above; flip if near viewport edge to avoid clipping.
  - Alternatives: Portal/root overlay; overkill for current scope.

- Decision: A11y pattern
  - Rationale: `aria-describedby` linking icon to tooltip; focus shows, blur/Esc hides; respects reduced motion.
  - Alternatives: `role=tooltip` only; accepted but `aria-describedby` provides clearer association.

## Risks

- Parsing performance on large datasets (16MB+): mitigation by enriching normalization once and reusing meta.
- DOM performance: create tooltip lazily per message, reuse node on subsequent interactions.

## Open Questions

- None blocking. All spec clarifications satisfied in this iteration.
