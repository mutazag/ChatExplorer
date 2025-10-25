# Feature Specification: Inline display of multimodal message content

**Feature Branch**: `001-multimodal-inline`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "if content message in conversation browser is multimodal, the image or multimedia item should also be displayed in the conversation browser inline in the conversation thread"

## Clarifications

### Session 2025-10-25

- Q: Which URL schemes are allowed for media sources? → A: Allow http(s), protocol-relative, relative, and data:image/audio/video only; disallow blob: and javascript:.

## User Scenarios & Testing

### User Story 1 - View images inline (Priority: P1)

As a user, when a message contains an image, I want to see the image displayed inline within the conversation thread so I can understand the context without leaving the page.

Why this priority: Images are the most common multimodal content and deliver immediate value for comprehension.

Independent Test: Load a conversation with a message that includes an image; verify an <img> is rendered with appropriate alt text and sizing.

Acceptance Scenarios:

1. Given a message with an image URL, When I open the conversation, Then the image appears inline under the message role/timestamp.
2. Given multiple images in one message, When I open the conversation, Then all images render in-order as a grid/stack with consistent sizing.

---

### User Story 2 - Play audio and video inline (Priority: P1)

As a user, when a message contains audio or video, I want an inline player so I can play it without downloading files or opening a new tab.

Why this priority: Keeps the flow within the thread and supports richer reviews of conversations with media.

Independent Test: Load a message with audio and a message with video; verify <audio controls> and <video controls> appear and can be interacted with.

Acceptance Scenarios:

1. Given a message with an audio source, When I open the conversation, Then an audio player with controls is shown and can be started/stopped.
2. Given a message with a video source, When I open the conversation, Then a video player with controls is shown with sensible default size and can be played/paused.

---

### User Story 3 - Accessibility and safety (Priority: P2)

As a user, images and media should be accessible (alt text, labels) and safe (no executable content or arbitrary navigation).

Why this priority: Ensures inclusivity and security when rendering external media.

Independent Test: Inspect rendered media for alt text, aria labels, and absence of scriptable attributes.

Acceptance Scenarios:

1. Given an image without explicit alt text, When rendered, Then it has a default alt derived from the file name or “image”.
2. Given an audio or video element, When rendered, Then it includes controls and an aria-label indicating the media type and message role.

### Edge Cases

- Unavailable media (404 or blocked): show a non-intrusive error state near the media placeholder.
- Unsupported types (e.g., application/*): render a downloadable link with type label instead of inline player.
- Excessively large media: constrain via layout (CSS max-width/height) to avoid layout break.
- Multiple media items in a single message: maintain deterministic order; avoid overflows with wrapping/stacking.

## Requirements

### Functional Requirements

- FR-001: System MUST detect multimodal parts in a message and render them inline after the text in the message body.
- FR-002: System MUST support inline display for image types: PNG, JPEG, GIF, WebP (by file extension or provided MIME type).
- FR-003: System MUST support inline playback for audio (MP3, WAV, OGG) and video (MP4, WebM) when a browser-native source is provided.
- FR-004: If a media type is unsupported, System MUST render a labeled download link including the file name and type.
- FR-005: All inline media MUST include accessible labeling: images with alt, audio/video with aria-label and controls.
- FR-006: Media rendering MUST disallow scriptable/event attributes from external content; no inline scripts or event handlers are permitted.
- FR-007: Layout MUST constrain media to fit within the thread (e.g., max-width: 100%, reasonable max-height) while preserving aspect ratio.
- FR-008: If media fails to load, System MUST show a fallback message adjacent to the media element (e.g., “Media failed to load”).

- FR-017: Allowed media URL schemes are limited to http(s), protocol‑relative, relative paths, and data:image/audio/video. The system MUST block javascript: and blob: URLs for media sources.

#### Media Asset Resolution (Pointers → Files)

- FR-009: The system MUST resolve media asset pointers in multimodal parts to local files when available under the selected export folder. The asset index MUST be built client-side at runtime by inspecting available files (from user-picked File API inputs or by parsing dataset directory listings) — no precomputed manifests are required or used.
- FR-010: For pointers with scheme `file-service://file-<ID>`, the system MUST map to the first file whose basename starts with `file-<ID>` within the export tree (prefix match), e.g., `file-1Cym1F...-Screenshot_...jpg`. When a dataset is loaded via `data/<dataset>` (e.g., `data/extract1`), the resolved relative path MUST include the dataset prefix, e.g., `data/extract1/file-1Cym1F...-Screenshot_...jpg`.
- FR-011: For pointers with scheme `sediment://file_<ID>`, the system MUST map to the first file whose basename starts with `file_<ID>` (underscore variant) within the export tree (prefix match).
- FR-012: For generated images with a generation identifier (e.g., `generation.gen_id`), the system MUST search under user content folders (e.g., `user-*/`) for matching file prefixes and include them as images if found.
- FR-013: For `audio_transcription` and related audio parts, the system MUST search within a folder named after the `conversation_id` (e.g., `.../<conversation_id>/audio/`) for files whose basenames start with the `asset_pointer` ID (prefix match) and attach them as audio media.
- FR-014: For `video_container_asset_pointer` and related video parts, the system MUST search within `.../<conversation_id>/video/` for files whose basenames start with the `asset_pointer` ID (prefix match) and attach them as video media.
- FR-015: If multiple matches exist, the system MUST choose deterministically (shortest basename; then lexicographically) and record the selected path.
- FR-016: If no local file is found for a pointer, the system MUST degrade to a labeled download link using the pointer ID and declared type.
  
Implementation notes for FR-010:

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

### Key Entities

- Message (UI): { role: string, text?: string, media?: Array<{ kind: 'image'|'audio'|'video'|'file', url: string, mime?: string, alt?: string, name?: string, pointer?: { scheme: 'file-service'|'sediment'|string, id: string }, source?: 'resolved'|'inline'|'unknown' }> }
- RenderedMedia: DOM elements (<img>, <audio>, <video>, or <a download>) appended after message text.

### Assumptions & Dependencies

- Assumptions:
	- Normalization exposes media parts per message with resolvable URLs and optional MIME types; asset pointers are resolvable by prefix matching against export files.
	- Media sources are accessible as relative paths under the export root or http(s) URLs; blob/object URLs are not used.
	- Target browsers support HTML5 audio/video elements (Edge/Chrome latest on Windows).
	- No external network calls are required for rendering media thumbnails/players.
- Dependencies:
	- Parser/normalizer updates required to build an asset index from the selected export folder and resolve pointers (file-service, sediment, audio/video containers) into relative URLs.
	- Basic CSS for responsive sizing (max-width/height) to prevent layout overflow.

## Success Criteria

### Measurable Outcomes

- SC-001: At least one sample for each supported media type renders or plays inline successfully in testing.
- SC-002: 100% of media elements include required accessibility attributes (alt or aria-label) verified via DOM inspection.
- SC-003: For unsupported types, a labeled download link is shown in 100% of cases in tests.
- SC-004: Media rendering introduces no console errors during normal playback across latest Chrome/Edge on Windows.
- SC-005: 0% of rendered media sources use blocked schemes (javascript:, blob:); 100% conform to allowed schemes.
