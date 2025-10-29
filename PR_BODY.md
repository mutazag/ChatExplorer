Title: spec(visual-themes): add role-icon tooltip with JSON context (003-visual-themes-tooltips)

Summary:
- Updates the Visual Themes specification to include a new user story for tooltips shown when hovering/focusing the role icon on message bubbles.
- Tooltip displays a concise subset of relevant fields from data/newchat/conversations.json (e.g., role, message id, parent id, content type, created time, and assistant model slug when applicable).
- Adds functional requirements FR-008..FR-012, new success criteria SC-007..SC-009, edge cases, assumptions, and updates the spec quality checklist.

What’s included:
- specs/001-visual-themes/spec.md — Adds “User Story 6 - Role icon tooltip with JSON context (P2)”, FR-008..FR-012, SC-007..SC-009, edge cases, and assumptions.
- specs/001-visual-themes/checklists/requirements.md — Updated checklist reflecting the tooltip addition and revalidation.

Behavior and guarantees:
- Tooltip appears on hover/focus within 100ms, is accessible via keyboard, and hides on blur/escape.
- Tooltip content maps deterministically to the underlying message JSON used to render the bubble.

How to verify:
1) Open a conversation and hover/focus the role icon on both user and assistant messages.
2) Verify tooltip fields match the message’s node in data/newchat/conversations.json.
3) Confirm long values are truncated; placement avoids clipping; keyboard users can access and dismiss the tooltip.

Acceptance criteria:
- New user story and FRs/SCs are present and testable in the spec.
- Checklist updated and passes; scope and edge cases clearly defined.

Checklist:
- [ ] CI green on this PR.
- [ ] Artifact uploaded contains expected files and structure.
- [ ] Optional Release step reviewed and left commented (or enabled in a follow-up if long-term retention is required).

Notes:
- Default base branch here is master; switch to main if your repo’s default differs.

Signed-off-by: PR generator
