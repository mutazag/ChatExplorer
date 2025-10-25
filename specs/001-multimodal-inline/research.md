# Research — Inline multimodal content

Date: 2025-10-25
Branch: 001-multimodal-inline
Spec: ./spec.md

## Decisions

1) Media discovery and normalization (RESOLVED)
- Decision: Extend `src/data/conversations/parse.js` to produce `message.media[]` by scanning ChatGPT export message content for media parts. Map recognized items as:
  - kind: `image` | `audio` | `video` | `file`
  - url: resolved relative path where available
  - mime: best-effort from export or file extension
  - alt/name: derived from export fields or filename
- Rationale: Keeps UI simple; isolates extraction in one place; aligns with existing normalization.
- Alternatives: Parse media at render-time (couples UI to export schema); embed base64 (bloats DOM and memory).

2) URL scheme for local media (RESOLVED)
- Decision: Use relative URLs when present in export or companion folders under `data/extract*/...` (e.g., audio/ subfolders). For file-only identifiers, construct relative paths based on the export directory layout where feasible; otherwise treat as `file` kind with a download link.
- Rationale: Preserves offline capability; avoids external calls.
- Alternatives: Blob/object URLs (requires additional loading code); absolute filesystem paths (not portable in browser context).

3) Default sizing for media (RESOLVED)
- Decision: CSS constraints in the thread container:
  - Images: `max-width: 100%`, `height: auto`, `max-height: 320px` (scroll page for larger)
  - Video: `max-width: 100%`, `height: auto`, `max-height: 360px`
  - Audio: native controls only; no width constraint beyond container
- Rationale: Prevents layout break; keeps UI consistent without complex lightboxes.
- Alternatives: Lightbox/zoom (adds complexity); fixed pixel widths (hurts responsiveness).

4) Asset pointer resolution (RESOLVED)
- Decision: Implement prefix-based resolution for asset pointers using the selected export folder file list (from folder selection). Rules:
  - `file-service://file-<ID>` → match basenames starting with `file-<ID>` anywhere under export root
  - `sediment://file_<ID>` → match basenames starting with `file_<ID>`
  - Conversation-scoped media:
    - `audio_transcription` and `audio_asset_pointer` → search `<conversation_id>/audio/` or `<conversation_id>/`
    - `video_container_asset_pointer` → search `<conversation_id>/video/` or `<conversation_id>`
    - use similar logic for multimodal assets in conversations.json for a `conversation_id`
  - Generated images (with generation IDs) may live under `user-*` folders; include those in search paths
  - If multiple matches: prefer shortest basename, else lexicographic
  - If no match: degrade to labeled download link with pointer ID and type
- Rationale: Export naming uses stable pointer prefixes with appended descriptors/guids; prefix matching is deterministic and performant with an index.
- Alternatives: Hash/content inspection (unavailable offline); heuristic MIME sniffing (adds risk/complexity).

## Rationale

- Centralizing media extraction in normalization maintains a clear contract for UI modules and simplifies testing.
- Relative URL approach ensures portability and keeps the architecture client-only and offline-friendly.
- Conservative CSS constraints give predictable results across devices and comply with the constitution’s minimal UI complexity.

## Alternatives Considered

- On-demand media fetching and blob URLs: rejected for added complexity and indirect coupling.
- External lightbox/gallery library: rejected to maintain minimal dependencies.
- Automatic MIME sniffing: rejected to avoid security and complexity; rely on export metadata and file extensions when necessary.
