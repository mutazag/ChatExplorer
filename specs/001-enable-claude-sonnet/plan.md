# Implementation Plan: Enable Claude Sonnet 4.5 (Client-Side Settings)

Created: 2025-10-25
Status: Ready
Source Spec: specs/001-enable-claude-sonnet/spec.md

## Overview
Within a client-only app (no network calls), expose a Settings panel to set the default model to "Claude Sonnet 4.5" for all users of this app. Persist locally, provide per-session override, and surface channel capabilities (text + images) in UI. No external API integration—policy is configuration only.

## Architecture
- Vanilla HTML/CSS/JS settings module
- Modules
  - `settings/modelSettings.js` (read/write from `localStorage` + in-memory)
  - `ui/settingsPanel.js` (toggle and selector UI)
  - `policy/modelPolicy.js` (derive effective model with precedence: session > user default)
  - `ui/badges/modelBadge.js` (surface current model in header)

## Policy & Governance
- Clients: all users of this application
- Precedence: Default = Claude Sonnet 4.5; per-session override allowed
- Channels: text + images; UI enables/disables image attachment affordances accordingly
- Audit: record setting changes in an in-memory log for current session (exportable as JSON)

## Constitution Gate Check
- Client-side only: PASS (no API calls)
- Minimal dependencies: PASS
- Tests required: PASS
- File-based data: PASS (settings persisted in localStorage)
- UI & Branding: PASS (badge/controls styled within existing header)

## Phases
1) Settings storage and policy resolution
2) Settings panel UI + header badge
3) Channel capability toggles (text/images)
4) Session override controls
5) Tests (policy, persistence, UI state)

## Test Plan
- Unit: policy precedence (session over default); default set to Sonnet 4.5
- Unit: persistence read/write in localStorage (guard for quota)
- Unit: channel capability flags (images on/off)
- Integration: UI reflects changes immediately; badge updates

## Risks & Mitigations
- No backend → clarify as configuration-only; future integration points stubbed
- LocalStorage disabled/private mode → degrade gracefully (session-only)

## Deliverables
- Settings modules + UI
- `tests/enable-claude/*.spec.js` + `tests/index.html`
