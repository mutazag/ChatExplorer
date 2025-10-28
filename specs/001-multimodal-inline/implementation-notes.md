# Implementation notes for media asset resolution (moved from spec)

This document contains technical implementation details that were intentionally moved out of the primary feature specification to keep the spec focused on WHAT and WHY.

## FR-010: Example resolution flow and rendering notes

- Input example (image):
	- `content_type`: `multimodal_text`
	- Part: `{ content_type: 'image_asset_pointer', asset_pointer: 'file-service://file-SnhAVAcycHQEv8Xu15wTXK', width, height, metadata }`
- Resolution:
	- Extract prefix `file-SnhAVAcycHQEv8Xu15wTXK`
	- Build an asset index in the browser:
		- If the user picked a folder/files, use the provided File objects and their paths (e.g., `webkitRelativePath`) to enumerate candidates.
		- If a dataset is selected (e.g., `data/extract1`), fetch the dataset directory index HTML and parse anchors to enumerate files; optionally fetch subdirectory indices for `user-*` and `<conversation_id>/(audio|video)/` folders.
		- Search the in-memory index for files whose basename starts with the prefix
	- Choose deterministic match and construct a dataset-relative URL, e.g., `./data/extract1/file-SnhAVAcycHQEv8Xu15wTXK-Screenshot_20250723_204157_Duolingo.jpg`
- Rendering:
	- Set `<img src>` to the resolved relative URL
	- Any fallback `<a>` link MUST use `href` equal to the same resolved relative URL
	- Continue to enforce FR-017 safe URL policies against the resolved URL

## Notes
- These notes are implementation guidance for developers and are intentionally separate from the stakeholder-facing specification.
- Keep these details in the implementation notes so the spec remains technology-agnostic and focused on measurable outcomes.
