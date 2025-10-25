# Quickstart: Dataset List with Icon and Time

The app discovers datasets under `data/` and shows each folder with a folder icon and a time label derived from available metadata.

## Using it
1. Serve the project with a static server that exposes a directory listing for `/data/` (or use the built-in empty-state + legacy picker).
2. Click "Select Export Folder". A list of datasets appears with a folder icon, name, and time.
3. Choose a dataset to load its `conversations.json` and browse conversations.

## Add a dataset
1. Create a folder under `data/`, e.g. `data/my-export/`.
2. Place `conversations.json` inside that folder.
3. Reload the app. If your server lists `/data/`, the folder appears automatically.

## Time label source
- Primary: `Last-Modified` HTTP header on `data/<name>/conversations.json`.
- Fallbacks: Directory index "Last modified" column; or, after loading, compute from conversations (e.g., latest message time).

## Assets
- Folder icon: `assets/folder.svg` (or inline SVG). Keep assets local.

## Troubleshooting
- No folders listed: Your server may not expose directory listings; use the legacy picker from the empty state or configure a server that lists `/data/`.
- Time shows "Unknown": The server may omit `Last-Modified`; load the dataset once so the app can compute a time from its data.
