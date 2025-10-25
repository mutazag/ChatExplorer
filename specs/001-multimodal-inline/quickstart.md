# Quickstart — Inline multimodal content

This feature renders images/audio/video inline in the conversation detail view.

## View tests

- Open `tests/index.html` in a modern browser (Chrome/Edge on Windows)
- Verify new tests for media rendering (to be added in implementation) pass

## Data setup

- Use existing sample exports under `data/` (e.g., `data/extract1/...`) that contain media
- Select the export folder in the app (folder selector) so the parser can index files for pointer resolution
- Asset pointer resolution rules (prefix match):
	- file-service://file-<ID> → match basenames starting with file-<ID>
	- sediment://file_<ID> → match basenames starting with file_<ID>
	- audio_transcription / audio_asset_pointer → <conversation_id>/audio/
	- video_container_asset_pointer → <conversation_id>/video/
	- generated images may be under user-*/
- Ensure resolved paths are reachable as relative URLs when served (http://localhost) or opened directly

## Implementation notes

- Normalization will attach `media[]` to each message when media is present
- UI will render `media[]` immediately after the Markdown body in the detail view
- Unsupported media produce a labeled download link
- On load error, a fallback message appears near the media element
