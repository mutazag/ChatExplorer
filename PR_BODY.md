Title: feat(cd): build artifacts workflow with manifest validation (001-cd-build-artifacts)

Summary:
- Adds a CI workflow that packages runtime code and the data/ directory (datasets) into a deployable build artifact, excluding specs/tests and other non-runtime files.
- Generates a manifest.json capturing all included files and metadata (commit SHA, createdAt, name) and validates it against deny rules to guarantee exclusions.
- Uploads the artifact to GitHub Actions with 90-day retention by default; provides a commented optional Release step for longer retention.
- Documents usage in a feature quickstart and adds a README badge linking to the workflow.

What’s included:
- .github/workflows/cd-build-artifacts.yml — CI workflow: checkout → setup Node → package → validate → upload → job summary (pure Node, no external deps). Optional Release step is commented.
- scripts/cd/build-artifacts.mjs — Copies runtime files (index.html, styles.css, assets/**, src/**) and includes the full data/ directory (datasets); writes manifest.json under artifact-out/build-artifacts/.
- scripts/cd/validate-manifest.mjs — Enforces deny rules and fails the job on violation.
- scripts/cd/filters.json — Deny patterns (e.g., specs/, tests/, **/*.test.*).
- specs/001-cd-build-artifacts/contracts/manifest.schema.json — Contract for manifest shape.
- specs/001-cd-build-artifacts/quickstart.md — How to trigger (push to master or manual dispatch), validate, and retrieve artifacts.
- README.md — Adds a workflow status badge for discoverability.

Behavior and guarantees:
- Runtime code and the complete data/ datasets are packaged; specs/, tests/, and other prohibited paths are excluded by construction and validated post-packaging.
- Artifact name: build-artifacts-<sha>; retention ~90 days (subject to org policy).
- Job summary prints manifest counts and key paths for quick inspection.

How to verify:
1) Trigger the workflow via manual dispatch from the Actions tab or by pushing to master.
2) Inspect the workflow run → Summary for manifest counts and included roots.
3) Download the artifact and confirm contents match runtime + data files; verify manifest.json exists with expected metadata.
4) Intentionally add a prohibited file (e.g., tests/tmp.test.js) to confirm the validator fails the run.

Acceptance criteria:
- Build artifact contains only runtime files plus data/ datasets; specs/tests are excluded.
- Manifest is generated and validated; the workflow fails on violations.
- Artifact is uploaded and retained; documentation and badge are present.

Checklist:
- [ ] CI green on this PR.
- [ ] Artifact uploaded contains expected files and structure.
- [ ] Optional Release step reviewed and left commented (or enabled in a follow-up if long-term retention is required).

Notes:
- Default base branch here is master; switch to main if your repo’s default differs.

Signed-off-by: PR generator
