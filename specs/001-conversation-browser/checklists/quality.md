# Requirements Quality Checklist — Conversation Browser

Purpose: Unit tests for requirements quality (not implementation). Validate clarity, completeness, consistency, measurability, and coverage of the Conversation Browser feature.

Created: 2025-10-25
Feature: specs/001-conversation-browser/

## Requirement Completeness

- [ ] CHK001 Are data source assumptions (array format, presence of `conversation_id`, `mapping`, `current_node`) explicitly documented? [Completeness, Spec §Data model confirmation]
- [ ] CHK002 Are all required list item data points specified (title fallback, human‑readable timestamp, selection state)? [Completeness, Spec §FR-004, §FR-005]
- [ ] CHK003 Is the sorting requirement fully specified including tie‑breakers and missing timestamps? [Completeness, Spec §FR-003]
- [ ] CHK004 Is the reconstruction of messages from `mapping` along `current_node` specified end‑to‑end (start node, termination, orphan handling)? [Completeness, Spec §FR-006]
- [ ] CHK005 Are pagination requirements complete (page size, navigation controls, disabled states, first/last behavior)? [Completeness, Spec §FR-009]
- [ ] CHK006 Are error states for missing/malformed `conversations.json` fully specified (copy, placement, recovery guidance)? [Completeness, Spec §FR-008]

## Requirement Clarity

- [ ] CHK007 Is the title fallback order unambiguous and ordered (title → conversation_id → first non‑system excerpt → “Untitled”)? [Clarity, Spec §FR-007]
- [ ] CHK008 Is “omit visually hidden system scaffolding” defined with the exact metadata flags that drive omission? [Clarity, Spec §FR-006]
- [ ] CHK009 Are multimodal “image pointer” representations specified (label text, icon, ARIA label, interaction=none)? [Clarity, Spec §Data model confirmation, §FR-006]
- [ ] CHK010 Are time units (epoch seconds, float) and timezone display rules stated for both create/update times? [Clarity, Spec §Data model confirmation, §FR-004]
- [ ] CHK011 Is the list sorting direction (“newest → oldest”) consistently stated for all contexts (list, paging changes, reload)? [Clarity, Spec §Clarifications, §FR-003]
- [ ] CHK012 Is the definition of “active path” precise (exclusive of branched nodes not on path to `current_node`)? [Clarity, Spec §FR-006]

## Requirement Consistency

- [ ] CHK013 Do title fallback rules in FR‑007 align with the Clarifications and Key Entities sections? [Consistency, Spec §FR-007, §Key Entities]
- [ ] CHK014 Do performance targets align with pagination requirement (25/page) and large dataset expectations? [Consistency, Spec §FR-009, §Measurable Outcomes]
- [ ] CHK015 Do assumptions about client‑only, no network calls, align across spec and plan? [Consistency, Spec §FR-010, Plan §Overview]
- [ ] CHK016 Does message role handling (user/assistant/system/tool) remain consistent between spec and plan? [Consistency, Spec §Key Entities, Plan §Data Model]

## Acceptance Criteria Quality

- [ ] CHK017 Are performance outcomes quantified with thresholds and scope (device “typical laptop”, item counts)? [Acceptance Criteria, Spec §Measurable Outcomes]
- [ ] CHK018 Are sorting correctness criteria measurable (100% newest→oldest) and testable independently? [Acceptance Criteria, Spec §Measurable Outcomes SC‑005]
- [ ] CHK019 Are error handling success criteria measurable (clear error shown within 1s, no crashes)? [Acceptance Criteria, Spec §Measurable Outcomes SC‑003]
- [ ] CHK020 Is selection responsiveness measurable (detail updates ≤500ms) and bound to a scenario? [Acceptance Criteria, Spec §Measurable Outcomes SC‑002]

## Scenario Coverage

- [ ] CHK021 Are primary list/detail flows covered separately with independent acceptance scenarios? [Coverage, Spec §User Story 1, §User Story 2]
- [ ] CHK022 Are exception flows for malformed/missing data covered with requirements (user guidance, retain app stability)? [Coverage, Spec §FR-008]
- [ ] CHK023 Are alternate flows for empty datasets (zero conversations) specified (empty state copy/appearance)? [Coverage, Spec §Edge Cases]
- [ ] CHK024 Are large dataset flows (≥1000 convos) covered with responsiveness and pagination usability? [Coverage, Spec §FR-009, §Measurable Outcomes]
- [ ] CHK025 Are branchy conversation flows addressed (non‑active branches intentionally excluded from main view)? [Coverage, Spec §Assumptions, §FR-006]

## Edge Case Coverage

- [ ] CHK026 Are duplicate or null timestamps addressed (sort fallback, stable ordering)? [Edge Case, Spec §Edge Cases, §FR-003]
- [ ] CHK027 Are conversations lacking `title` and `conversation_id` covered (fallback to first non‑system excerpt then “Untitled”)? [Edge Case, Spec §FR-007]
- [ ] CHK028 Are nodes with missing `message` or broken parent links handled (skip or degrade gracefully)? [Edge Case, Spec §FR-006, §FR-008]
- [ ] CHK029 Are extremely long titles/messages addressed in list truncation vs full detail display? [Edge Case, Spec §Edge Cases]

## Non-Functional Requirements

- [ ] CHK030 Is client‑only operation explicitly required with no network calls or external services? [NFR, Spec §FR-010]
- [ ] CHK031 Are accessibility expectations stated (keyboard navigation, focus order, aria‑live for errors)? [NFR, Spec §User Story 3 P3, Plan §UX & Accessibility]
- [ ] CHK032 Are performance budgets consistent across list and detail panes and measurable with the given dataset sizes? [NFR, Spec §Measurable Outcomes]
- [ ] CHK033 Are responsiveness requirements for pagination interactions documented (no jank, quick focus movement)? [NFR, Plan §UX & Accessibility, Spec §FR-009]
- [ ] CHK034 Is browser compatibility target documented or intentionally deferred (and marked)? [NFR, [Gap]]

## Dependencies & Assumptions

- [ ] CHK035 Are dependencies on export schema versions (ChatGPT export) captured, including tolerance for field variance? [Dependency, Spec §Data model confirmation]
- [ ] CHK036 Are assumptions about `multimodal_text` asset availability (no file fetching) documented? [Assumption, Spec §Data model confirmation]
- [ ] CHK037 Are hash routing assumptions for selection persistence stated or explicitly optional? [Assumption, Plan §Architecture]
- [ ] CHK038 Is the pagination size (25) stated as fixed, configurable, or constant with rationale? [Assumption, Spec §FR-009]

## Ambiguities & Conflicts

- [ ] CHK039 Is the behavior for identical timestamps (ties) explicitly defined (secondary key, stable order)? [Ambiguity, Spec §FR-003, [Gap]]
- [ ] CHK040 Is the treatment of tool messages and hidden system nodes conflict‑free across spec sections? [Conflict, Spec §FR-006, §Key Entities]
- [ ] CHK041 Is the definition of “human‑readable timestamp” specified (format, locale, relative vs absolute)? [Ambiguity, Spec §FR-004, [Gap]]
- [ ] CHK042 Are image placeholder semantics (count, ordering among text parts) specified unambiguously? [Ambiguity, Spec §Data model confirmation, [Gap]]
