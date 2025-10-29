# Quickstart: CD Build Artifacts

This guide explains how to trigger the CD workflow that packages runtime code and the `data/` folder structure (no specs/tests) into a retained artifact.

## Trigger
- Push or merge to `master` (or manually dispatch if defined in the workflow).

## What it produces
- A ZIP artifact named like `build-artifacts-<short-sha>` containing:
  - index.html, styles.css
  - assets/** (runtime assets only)
  - src/** (application code)
  - data/** (directory structure only; no content files)
  - manifest.json (paths included; counts/sizes where applicable)

## How to retrieve
1. Open the latest workflow run under the Actions tab.
2. Download the artifact `build-artifacts-<short-sha>`.
3. Inspect `manifest.json` to verify inclusion/exclusion.

## Notes
- Artifacts are retained for 90 days by default (subject to org policy). Consider publishing a GitHub Release for long-term retention in a separate feature.
