# Quickstart: CD Build Artifacts

This guide explains how to trigger the CD workflow that packages runtime code and the `data/` folder (including dataset files, no specs/tests) into a retained artifact.

## Trigger
- Push or merge to `master`.
- Or run manually from GitHub → Actions → "CD Build Artifacts" → Run workflow.

## What it produces
- A ZIP artifact named like `build-artifacts-<short-sha>` containing:
  - index.html, styles.css
  - assets/** (runtime assets only)
  - src/** (application code)
  - data/** (datasets included)
  - manifest.json (paths included; counts/sizes where applicable)

## How to retrieve
1. Open the latest workflow run under the Actions tab.
2. Download the artifact `build-artifacts-<short-sha>`.
3. Inspect `manifest.json` to verify inclusion/exclusion.

## Validation & retention
- The workflow validates that no spec/test artifacts are included. If violations are found, the job fails and lists offending paths.
- Artifacts are retained for 90 days by default (subject to org policy). For long-term retention, consider publishing a GitHub Release (optional step, see workflow file; currently commented).

## Notes
- Artifacts are retained for 90 days by default (subject to org policy). Consider publishing a GitHub Release for long-term retention in a separate feature.
