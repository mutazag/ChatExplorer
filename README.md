# 🚀 NewChatBrowser

Lightweight client-side conversation browser for ChatGPT exports with inline multimodal rendering.

This repository provides a small, dependency-free web app to browse exported ChatGPT conversations locally. It supports rendering multimodal message parts (images, audio, video) inline in the conversation thread and resolves asset pointers (e.g. `file-service://file-<ID>`) to files found in the selected export dataset.

## Key features ✨

- 🔎 Browse and inspect conversations exported from ChatGPT (JSON format).
- 🖼️ Inline rendering of multimodal content inside message bubbles (images, audio, video).
- 🧭 Runtime asset indexing: resolves `file-service://` and `sediment://` pointers by scanning the selected dataset or picked files (no precomputed manifests required).
- ♿ Accessible media: images include alt text; audio/video include controls and aria labels.
- 📱 Responsive UI with sensible constraints so images don't overwhelm the viewport.

## Quickstart (developer) ⚡

1. Open the project in a static file server or VS Code Live Server. Example (PowerShell):

```powershell
# from repository root
# Option A: run without installing (uses npx)
npx http-server . -p 8080

# Option B: install http-server globally (one-time)
npm install -g http-server
http-server . -p 8080

# Then open http://localhost:8080 in your browser
```

2. Open the app in your browser (recommended: Chrome/Edge). Use the folder selector (or dataset chooser) to pick an export under `data/` (for example `data/extract1`).

3. Select a conversation from the left column. Messages will render on the right. If messages contain multimodal parts, they appear inline inside the message bubble.

## Exporting ChatGPT data and placing it into `data/` 📥

Follow OpenAI's official instructions to request and download your ChatGPT export:

- Help article: https://help.openai.com/en/articles/7260999-how-do-i-export-my-chatgpt-history-and-data

Typical steps (summary):

1. Sign in at https://chat.openai.com and open Settings → Data controls → Export data.
2. Request an export (choose JSON if prompted). Wait for the email notification and download the ZIP archive when it's ready.
3. The downloaded ZIP contains JSON files (conversations.json) and associated asset files (images, audio, etc.) or nested folders. You should create a dataset folder under this repo's `data/` directory and extract the contents there so the app can find them.

PowerShell example (from the repository root) to extract a downloaded export into a dataset folder named `extract1`:

```powershell
# Adjust $zip to your downloaded file path
$zip = 'C:\Users\You\Downloads\chatgpt_export.zip'
Remove-Item -Recurse -Force .\data\extract1 -ErrorAction SilentlyContinue
Expand-Archive -Path $zip -DestinationPath .\data\extract1 -Force
```

Notes and tips:

- Preserve file names and relative paths from the export. The app resolves pointers like `file-service://file-<ID>` by matching basenames, so renaming files may break pointer resolution.
- If the ZIP contains a single top-level folder (common), adjust the destination or move `conversations.json` and the `file-*` assets directly under `data/<dataset>` so the app can scan them.
- For very large exports, extract only the conversations/assets you need to a new `data/<dataset>` folder to keep browsing responsive.
- If you serve the app from a local static server (see Quickstart), the app will be able to load assets via relative URLs (recommended). If you open `index.html` directly (file://), some browsers restrict loading local assets; use a local server like `http-server` instead.

## Asset pointer resolution rules 🔗

The app resolves asset pointers at runtime by prefix-matching basenames in the dataset or FileList. The rules implemented are:

- `file-service://file-<ID>` → match file basenames that start with `file-<ID>` (prefix match). When a dataset `data/<dataset>` is selected, resolved URLs include the dataset prefix (e.g. `data/extract1/file-<ID>-...jpg`).
- `sediment://file_<ID>` → same as above but underscore variant.
- Conversation-scoped audio/video: search under `data/<dataset>/<conversation_id>/(audio|video)/` for prefixed basenames.
- Generated images: prefer matches under `user-*` folders for generation metadata.

Selection is deterministic: shortest basename wins, then lexicographic tie-break.
If no local file is found, the UI falls back to a labeled download link (pointer string used as label).

### Examples

Here are concrete examples showing how common pointer strings map to files in a dataset called `data/extract1`.

- Pointer (image):

```text
file-service://file-5eE6gWRNNBRS2segT4y9gc
```

Resolved (example):

```text
data/extract1/file-5eE6gWRNNBRS2segT4y9gc-8688b4ae-634b-49a1-8155-4f43c28298c54689210616324093943.jpg
```

Explanation: the resolver finds files whose basenames start with `file-5eE6gWRNNBRS2segT4y9gc` and returns the dataset-relative path. If multiple matches exist, the shortest basename is chosen; ties broken by lexicographic order.

- Pointer (audio):

```text
sediment://file_9CqyvGrJecrcvsBhcMcMfa
```

Resolved (example):

```text
data/extract1/file-9CqyvGrJecrcvsBhcMcMfa-61800068-3291-4a88-9d71-a1f8e6aa1b9c7137010464782085427.wav
```

- Conversation-scoped pointer (audio/video stored under a conversation subfolder):

```text
file-service://file-SnhAVAcycHQEv8Xu15wTXK
```

Resolved (example):

```text
data/extract1/68666697-1db0-800f-9d6b-67f24546abc2/audio/file-SnhAVAcycHQEv8Xu15wTXK-Screenshot_20250723_204157_Duolingo.jpg
```

Notes:

- If a pointer cannot be matched to any file in the dataset or selected FileList, the UI shows a download link labeled with the pointer string so you can inspect or manually locate the asset.
- The resolver prefers dataset-relative URLs (so `img.src` or `a.href` will be `data/<dataset>/...`). This allows the app to load assets via a local static server without special CORS configuration.

## Developer notes 🛠️

- Source entry: `index.html` loads `src/app.js` which wires dataset discovery, file indexing, normalization, and UI rendering.
- Conversation normalization: `src/data/conversations/parse.js` builds message objects and `media[]` entries.
- Asset index: `src/utils/assetIndex.js` contains pointer parsing and prefix-match helpers.
- Dataset directory listing crawler: `src/data/datasets/discovery.js` can fetch and parse directory index HTML to enumerate files under `data/<dataset>/`.
- UI: `src/ui/detailView.js` handles message rendering; media are rendered inside the `.bubble` element.
- Styles: `styles.css` contains responsive media sizing and alignment logic.

## Visual/layout behavior 🎨

- User message bubbles, header (icon + label), and timestamp are aligned to the right; assistant messages remain left-aligned.
- Images are constrained with `max-height` (viewport-relative) and `object-fit: contain` to avoid breaking layout.

## Tests

- Tests are in `tests/` and run in-browser via the provided harness (`tests/index.html`). Add visual/layout assertions for bubble alignment and media rendering as needed.

## Contributing

- Follow repository conventions (vanilla JS, no build step). Small, focused PRs are preferred.
- Run and update tests under `tests/` when changing rendering behavior.

### Branching

- All feature work (spec, plan, implementation, tests) MUST happen on a dedicated feature branch
	named `[###-feature-name]` (e.g., `001-image-popout`).
- Do not commit directly to `master`. Open PRs from the feature branch targeting `master`.
- Each PR MUST include tests and reference the feature docs under `specs/[###-feature-name]/`.

## License

This repository doesn't include a license file by default. Add a `LICENSE` file if you plan to publish or redistribute.

