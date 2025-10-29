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
  - status?: string (optional; surfaced if present)
  - selected_sources?: string[] (optional; surfaced if present)
  - prompt_expansion_predictions?: string[] (optional; surfaced if present)
  - safe_urls?: string[] (optional; surfaced if present)
  - is_user_system_message?: boolean (optional; surfaced if present)
  - user_context_message_data?: object (optional; surfaced if present)

- TooltipSummary (derived for UI)
  - role: string
  - id: string
  - parentId?: string
  - contentType: string
  - createdTime?: number | string (humanized)
  - modelSlug?: string
  - status?: string
  - selected_sources?: string[]
  - prompt_expansion_predictions?: string[]
  - safe_urls?: string[]
  - is_user_system_message?: boolean
  - user_context_message_data?: object

## Relationships

- Message.meta.nodeId corresponds to `conversation.mapping[nodeId]`.
- parentId corresponds to `conversation.mapping[nodeId].parent` when available.

## Validation Rules

- When role == "assistant", TooltipSummary MAY include modelSlug.
- Missing fields are omitted from the UI (no literal "undefined").
- Long values (> 40 chars) are truncated with middle-ellipsis in UI only (data remains full length).
 - Optional fields (status, selected_sources, prompt_expansion_predictions, safe_urls) are included only if present in the source context.
