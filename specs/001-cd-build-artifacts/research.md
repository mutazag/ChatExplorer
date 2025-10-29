# Research: CD Build Artifacts

Created: 2025-10-29
Feature: ./spec.md

## Decisions and Rationale

### Decision 1: CI runner and orchestration
- Decision: Use GitHub Actions with `ubuntu-latest` runner
- Rationale: Repo is hosted on GitHub; Actions provides first-party artifact storage and easy retention controls.
- Alternatives:
  - Self-hosted runner: Adds maintenance overhead; not needed for this project’s scale.
  - Other CI (Azure DevOps, CircleCI): Out of scope for current repo hosting.

### Decision 2: Artifact format and retention
- Decision: Upload a ZIP artifact via `actions/upload-artifact@v4` with retention set to 90 days (default).
- Rationale: Built-in, simple retrieval from the Actions UI and API; retention is configurable per-upload or at org level.
- Alternatives:
  - Attach artifact to a GitHub Release for long-term retention: Heavier ceremony; consider when promoting releases.
  - Store in object storage (S3/Azure Blob): Requires credentials and infra that the repo avoids.

### Decision 3: Inclusion/Exclusion and directory-only copy for `data/`
- Decision: Include runtime app files: `index.html`, `styles.css`, `assets/**`, `src/**`.
  Include the `data/` directory hierarchy without file contents.
  Exclude development-only folders/files: `specs/**`, `tests/**`, `.specify/**`, `**/*.test.*`, `tests/**`, and hidden files under those paths.
- Rationale: Meets requirement to ship only runtime code plus data folder structure. Prevents leaking non-runtime artifacts.
- Alternatives:
  - Ship full `data/` content: Violates requirement; causes bloated artifacts.
  - Heuristic filters: Risk of missing prohibited files; whitelist + explicit exclusion is safer.

### Decision 4: Manifest generation and validation
- Decision: Generate a manifest (JSON) listing included paths and counts; validate zero prohibited files before packaging; fail build on violation.
- Rationale: Provides auditability and testable acceptance for exclusions.
- Alternatives:
  - Skip manifest: Harder to audit and verify; reduces confidence.

## Outstanding Considerations
- Long-term retention (beyond Actions retention windows) can be addressed by an optional Release publish step in a follow-up feature.
