# Data Model: Image pop-out (ImageLightbox)

This feature is primarily a UI component; data persisted is minimal (stateless UI). The data-model below documents the in-memory entities used by the lightbox and their key fields.

## Entities

### ImageLightbox
- Description: UI state representing the open lightbox and its interaction state.
- Fields:
  - open: boolean — whether the lightbox is visible
  - src: string — resolved image URL or data URI
  - width?: number — natural width (optional, used for layout)
  - height?: number — natural height (optional)
  - scale: number — current zoom scale (1.0 = fit-to-viewport by default)
  - pan: { x: number, y: number } — current pan offsets in pixels relative to center
  - lastFocusedElement?: string — CSS selector or element identifier to restore focus when closed

### Message (UI)
- Description: Message object, documented in the main multimodal spec; repeated here for clarity.
- Fields (subset): role, text, media[]
  - media item: { kind: 'image'|'audio'|'video'|'file', url: string, mime?: string, alt?: string, name?: string }

## Validation rules
- `src` MUST be a safe resolved URL (per FR-017 allowed schemes).
- `scale` MUST be >= 0.1 and <= 10 (configurable limits); pan offsets should be bounded based on scaled image dimensions.

Note: FR-017 is defined in the main multimodal-inline spec (`specs/001-multimodal-inline/spec.md`). If reviewers prefer this feature spec to be fully self-contained, we can copy the allowed-schemes list here; currently the implementation will reference the project's canonical allowed-schemes via the `mediaResolver` helper (see `src/utils/mediaResolver.js` in tasks).

## State transitions
- open:false -> open:true when image is activated (click or keyboard)
- When open:true, scale transitions via zoom in/out or pinch gestures; pan updated while scale > fit-to-viewport
- open:true -> open:false on ESC or overlay click, with focus restoration
