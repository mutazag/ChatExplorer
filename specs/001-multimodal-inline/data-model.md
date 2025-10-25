# Data Model — Inline multimodal content

Date: 2025-10-25
Branch: 001-multimodal-inline

## Entities

### Message (UI)
- id: string (conversation scoped ordering implied by create_time)
- role: 'user' | 'assistant' | other
- create_time: number | undefined
- text: string | undefined (Markdown)
- media: MediaItem[] | undefined

### MediaItem
- kind: 'image' | 'audio' | 'video' | 'file'
- url: string (relative URL preferred; resolved from pointer when possible)
- mime: string | undefined
- alt: string | undefined (images)
- name: string | undefined (download label for files)
- pointer: { scheme: 'file-service' | 'sediment' | string, id: string } | undefined
- source: 'resolved' | 'inline' | 'unknown' | undefined

## Relationships
- Conversation → Message[ ] (ordered by create_time)
- Message → MediaItem[ ] (0..N inline render targets)

## Validation Rules
- If kind = image → url required; alt defaulted from filename if missing
- If kind = audio|video → url required; controls enabled; aria-label includes media type and role
- If mime present and unsupported for inline rendering → fall back to 'file' kind

## Normalization Rules
- Extract media from export structure when present; if only IDs exist, resolve relative URLs by prefix-matching `asset_pointer` IDs:
	- file-service://file-<ID> → basename starts with file-<ID>
	- sediment://file_<ID> → basename starts with file_<ID>
	- audio under <conversation_id>/audio/, video under <conversation_id>/video/
	- generated images under user-* folders
- Preserve message order based on create_time; attach media list after text
- Omit hidden/system scaffolding nodes (unchanged from existing parser)

## Error Handling
- On load error for any media element, display a nearby text fallback: "Media failed to load"
- If url missing or invalid, skip inline render and create a 'file' download link with best-effort name
