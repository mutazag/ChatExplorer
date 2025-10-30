# Quickstart: Fix Mobile Folder Selector Visibility

This guide outlines the minimal steps to expose a visible, accessible data set selection control on mobile and enable switching between data sets without reloads.

## Prerequisites
- Branch: `001-fix-mobile-folder-selector`
- Spec: `specs/001-fix-mobile-folder-selector/spec.md`
- Plan: `specs/001-fix-mobile-folder-selector/plan.md`

## Steps

1. UI Entry Point (Mobile)
   - Add a visible control in the header or overflow menu that appears at ≤ 768px width.
   - Ensure 44×44px touch target where feasible; add `aria-label`.

2. CSS & Responsiveness
   - Use CSS media queries to display the control on small viewports.
   - Verify visibility across supported visual themes; maintain contrast and focus states.

3. Wiring to Selection Logic
   - On activation, open the data set chooser and route selection to existing selection logic.
   - Update the conversation list when `activeDataSetId` changes.

4. Edge Cases
   - Handle no data sets gracefully (informational message; dismiss path).
   - Truncate long names; ensure the full value is accessible via title/tooltip.

5. Tests (Write First)
   - Unit: selection module updates `activeDataSetId`.
   - Integration: mobile viewport shows control; selecting a data set switches conversations.
   - Visual: verify across 320px, 375px, 768px and theme variants.

## Verification
- Meet success criteria in the spec (discovery, time to complete, accessibility checks, no desktop regression).
- Run in-browser tests under `tests/` for unit and integration.
