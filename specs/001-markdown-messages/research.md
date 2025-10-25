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
