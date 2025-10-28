# research.md — Markdown Messages (auto-linking)

**Feature**: 001-markdown-messages  
**Created**: 2025-10-28

## Questions / Unknowns

- Q1: Use a vendored auto-link library (e.g., linkify-it) or implement a conservative regex-based auto-linker?  
  - Decision: Implement a conservative, well-tested regex-based auto-linker integrated into the existing Markdown pipeline to avoid adding runtime dependencies. If maintenance or edge-case coverage becomes onerous, vendor a small library and vendor it locally (no CDN).

- Q2: How to handle unsafe schemes and sanitizer integration?  
  - Decision: Block non-http(s) schemes for auto-links. Media rules (data:image/*) remain handled by media rendering logic. The sanitizer must be the single source of truth: auto-linker will only create anchors for normalized http/https URLs; afterwards, the HTML will be passed through existing sanitizer (`renderMarkdownToSafeHtml`) which will re-validate anchors.

## Alternatives Considered

- Use `linkify-it` (library) — Pros: robust URL parsing and unicode support. Cons: external dependency; needs vendoring to satisfy constitution.
- Regex approach — Pros: zero external deps, full control; Cons: risk of missing edge cases (IDN, certain punctuation rules). Mitigation: conservative regex + tests.

## Rationale

Conservative regex approach fits the project's constitution (minimal dependencies) and the small scope of rendering typical export messages. The sanitizer integration reduces XSS risk. We can revisit and vendor a small library if tests expose gaps.

## Implementation Notes

- Create `src/utils/links.js` with a small `autolinkText(text)` function that returns HTML with anchors for http(s) URLs, skipping code blocks and inline code (integrate with Markdown AST or post-processing that checks for code spans).
- Integrate `autolinkText` as a post-processing step inside `renderMarkdownToSafeHtml` or as a wrapper that runs before sanitization.
- Ensure anchors include `target="_blank"` and `rel="noopener noreferrer nofollow"` and `title` or `aria-label` containing the full URL.
- Add unit tests covering all acceptance scenarios listed in the spec.

## Next steps

1. Implement `src/utils/links.js` and add unit tests.
2. Update `src/utils/markdown.js` to invoke autolinker in the render pipeline.
3. Run integration tests and validate sanitizer behavior.
# Research — Markdown rendering and sanitization

Date: 2025-10-25
Branch: 001-markdown-messages
Spec: ./spec.md

## Decisions

1) Markdown subset and parsing approach (RESOLVED)
- Decision: Support headings, bold/italic, inline code, fenced code blocks, paragraphs, links, and lists. Implement a minimal parser to avoid external dependencies and keep control over output.
- Rationale: Limited subset covers common cases and keeps complexity low.
- Alternatives: Use a full Markdown library — rejected to maintain minimal dependencies.

2) Sanitization strategy (RESOLVED)
- Decision: Allowlist sanitizer for final HTML: P, BR, STRONG, EM, CODE, PRE, UL, OL, LI, A, H1–H6. Strip all event attributes and disallowed tags.
- Rationale: Prevent XSS; deterministic output; easy to audit.
- Alternatives: Rely on browser built-in sanitizer — inconsistent support and less control.

3) Link normalization (RESOLVED)
- Decision: Only enable http(s), mailto, and #. Add target="_blank" and rel="noopener noreferrer nofollow" for http(s).
- Rationale: Prevent malicious protocols; ensure safe external navigation.
- Alternatives: Open all links same-tab — worse UX; allow other schemes — security risk.

4) Accessibility (RESOLVED)
- Decision: Add aria-label="code block" on <pre> elements; keep DOM simple and semantic. Defer syntax highlighting.
- Rationale: Improves screen reader experience with minimal overhead.
- Alternatives: Add ARIA roles broadly — unnecessary; highlight.js — adds dependency.

## Alternatives Considered

- Full CommonMark compliance: overkill for current needs and increases complexity.
- Rich HTML passthrough: unsafe and violates security constraints.
- External sanitizer library: unnecessary; small inline sanitizer suffices.
