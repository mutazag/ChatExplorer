# Data Model: Folder Selector (Icon + Time)

Date: 2025-10-25

## Entities

- DatasetFolder
  - id: string (folder basename)
  - name?: string (display label; default = id)
  - path: string (relative, e.g., "data/extract1")
  - modifiedAt?: string (ISO 8601 from Last-Modified header or derived)
  - timeLabel?: string (formatted short date/relative label for UI)

- DiscoveryStrategy
  - mode: "directory-index" | "fallback"
  - details?: string

- SelectionState
  - selectedDataset?: { id, path, name?, modifiedAt?, timeLabel? }
  - selectedId?: string (conversation id)
  - selectedPath?: string

## Validation Rules

- path MUST be under `data/` and relative.
- conversations.json MUST exist for a valid dataset.
- modifiedAt SHOULD be a valid date string if available; if not, omit and set timeLabel="Unknown".

## Notes

- Time derivation precedence: Last-Modified (HEAD) > directory index column > computed from conversations after load.
- UI formats timeLabel via `toLocaleString()` or relative formatting.
