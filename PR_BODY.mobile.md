Title: fix(mobile): dataset chooser visibility, header reflow, and cleanup

Summary:
- Ensure dataset chooser is visible on mobile by temporarily showing the left pane when rendering dataset choices/empty state, then hide it after selection.
- Reflow header on small screens: logo + title on the first line, controls on the second line; reduce title size to conserve vertical space.
- Remove the dataset-control component from the UI; replace its integration tests with placeholders to keep the harness stable.
- Default pageSize is now 5 for mobile view (<= 860px) and 25 otherwise, aligning with the layout breakpoint for better small-screen usability.
- Merge latest origin/master into this feature branch.

Key changes:
- src/app.js
  - Add ensureLeftVisible() helper and call it around dataset chooser rendering ("Select Export Folder" and "Change Dataset" flows).
  - Stop mounting dataset-control; flows now use chooser directly.
- styles.css
  - Mobile header reflow via flex-wrap + ordering; smaller title font.
  - Remove dataset-control styles/references.
- src/ui/mobile/datasetControl.js
  - Replace with a no-op export to avoid breaking stale imports in old harness pages.
- tests/
  - Remove dataset-control harness entries; replace dataset-control integration specs with placeholders.
- src/state/appState.js
  - Initialize pageSize to 5 on mobile (<= 860px), 25 otherwise.

Behavior and guarantees:
- Mobile flows: dataset list pane appears when selecting/changing datasets and hides after selection; no page reload.
- Header remains sticky and readable; controls are accessible; smaller title reduces vertical chrome.
- Pagination defaults are more ergonomic on mobile.

How to verify:
1) Mobile width (<=768px):
   - Tap "Select Export Folder"; confirm dataset list is shown; pick one; pane hides after selection.
   - Use "Toggle Pane" to show/hide left pane; confirm it responds at mobile sizes.
   - Confirm header stacks (logo/title top row, controls second row).
2) Desktop width (>860px):
   - Standard layout continues to work; no regression in list/detail behavior.
3) Pagination:
   - On mobile, confirm initial page shows 5 items; desktop shows 25.

Notes:
- Base: master.
- No persistence added; all changes are UI and state-level only.
