# Data Model: Visual Themes – Role Icon Tooltips

Date: 2025-10-29

## Entities

- Message (UI)
  - id: string
  - role: "user" | "assistant"
  - text: string
  - create_time?: number
  - update_time?: number
  - media: Array<{ kind: "image"|"audio"|"video", src: string, mime?: string, alt?: string }>
  - meta: MessageMeta

- MessageMeta
  - nodeId: string (mapping key used to render the bubble)
  - parentId?: string
  - contentType: string
  - createdTime?: number
  - modelSlug?: string (assistant only)
  - requestId?: string (optional; may be truncated in UI)

- TooltipSummary (derived for UI)
  - role: string
  - id: string
  - parentId?: string
  - contentType: string
  - createdTime?: number | string (humanized)
  - modelSlug?: string

## Relationships

- Message.meta.nodeId corresponds to `conversation.mapping[nodeId]`.
- parentId corresponds to `conversation.mapping[nodeId].parent` when available.

## Validation Rules

- When role == "assistant", TooltipSummary MAY include modelSlug.
- Missing fields are omitted from the UI (no literal "undefined").
- Long values (> 40 chars) are truncated with middle-ellipsis in UI only (data remains full length).
