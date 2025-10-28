// Minimal Markdown to safe HTML renderer
import { autolinkHtml } from './links.js';
// Supports: headings, bold, italic, inline code, fenced code blocks, paragraphs, links, UL/OL lists
// Then sanitizes against an allowlist of tags/attributes

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitCodeFences(src) {
  const parts = [];
  let i = 0;
  // Support fenced code blocks with 3 or more backticks, matching the same length
  const fence = /(`{3,})([\s\S]*?)\1/g; // non-greedy, backreference to equal fence length
  let lastIndex = 0;
  let m;
  while ((m = fence.exec(src))) {
    const before = src.slice(lastIndex, m.index);
    if (before) parts.push({ type: 'text', value: before });
    // m[2] is the inner content; trim a single leading/trailing newline if present
    const code = m[2].replace(/^\n|\n$/g, '');
    parts.push({ type: 'codeblock', value: code });
    lastIndex = fence.lastIndex;
  }
  const rest = src.slice(lastIndex);
  if (rest) parts.push({ type: 'text', value: rest });
  return parts;
}

function parseInline(md) {
  let html = escapeHtml(md);
  // links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, text, href) => {
    // Escape already done; store href raw for now; will sanitize later
    const safeText = text;
    const safeHref = href; // sanitized later
    return `<a data-raw-href="${safeHref}">${safeText}</a>`;
  });
  // bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic *text*
  html = html.replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, (m, lead, inner) => `${lead}<em>${inner}</em>`);
  // inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}

function groupBlocks(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Tables (GFM-style pipe tables)
    // Detect a header line with '|' followed by a separator line of --- style
    const next = lines[i + 1];
    const looksLikeHeader = line && line.includes('|');
    const isSeparator = (l) => {
      if (!l) return false;
      const t = l.trim();
      // examples: | --- | :---: | ---: | --- |
      const cell = ':?-{3,}:?';
      const re = new RegExp(`^\\|?\\s*${cell}(?:\\s*\\|\\s*${cell})+\\s*\\|?$`);
      return re.test(t);
    };
    if (looksLikeHeader && isSeparator(next)) {
      // parse header cells
      const splitCells = (l) => {
        let s = String(l).trim();
        if (s.startsWith('|')) s = s.slice(1);
        if (s.endsWith('|')) s = s.slice(0, -1);
        return s.split('|').map(c => c.trim());
      };
      const headerCells = splitCells(line);
      const alignSpecs = splitCells(next).map(seg => {
        const t = seg.trim();
        const left = t.startsWith(':');
        const right = t.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        if (left) return 'left';
        return 'left';
      });
      i += 2; // consume header + separator
      const rows = [];
      while (i < lines.length) {
        const rline = lines[i];
        if (!rline || !rline.includes('|')) break;
        const rowCells = splitCells(rline);
        rows.push(rowCells);
        i++;
      }
      blocks.push({ type: 'table', header: headerCells, aligns: alignSpecs, rows });
      continue;
    }
    // Headings
    const hm = /^(#{1,6})\s+(.*)$/.exec(line);
    if (hm) {
      const level = hm[1].length;
      blocks.push({ type: 'heading', level, text: hm[2] });
      i++; continue;
    }
    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }
    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }
    // Blank line -> paragraph boundary
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    // Paragraph: accumulate until blank line
    const para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6})\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'p', text: para.join('\n') });
  }
  return blocks;
}

function renderBlocksToHtml(blocks) {
  const html = [];
  for (const b of blocks) {
    if (b.type === 'heading') {
      const inner = parseInline(b.text);
      html.push(`<h${b.level}>${inner}</h${b.level}>`);
    } else if (b.type === 'p') {
      const inner = parseInline(b.text);
      html.push(`<p>${inner}</p>`);
    } else if (b.type === 'ul') {
      const items = b.items.map(t => `<li>${parseInline(t)}</li>`).join('');
      html.push(`<ul>${items}</ul>`);
    } else if (b.type === 'ol') {
      const items = b.items.map(t => `<li>${parseInline(t)}</li>`).join('');
      html.push(`<ol>${items}</ol>`);
    } else if (b.type === 'table') {
      const colClass = (i) => {
        const a = (b.aligns && b.aligns[i]) || 'left';
        if (a === 'center') return 'align-center';
        if (a === 'right') return 'align-right';
        return 'align-left';
      };
      const thead = `<thead><tr>${b.header.map((h, idx) => `<th class="${colClass(idx)}">${parseInline(h)}</th>`).join('')}</tr></thead>`;
      const tbodyRows = (b.rows || []).map(r => {
        return `<tr>${r.map((c, idx) => `<td class="${colClass(idx)}">${parseInline(c)}</td>`).join('')}</tr>`;
      }).join('');
      const tbody = `<tbody>${tbodyRows}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
    }
  }
  return html.join('');
}

function sanitizeHtml(html) {
  const allowedTags = new Set(['P','BR','STRONG','EM','CODE','PRE','UL','OL','LI','A','H1','H2','H3','H4','H5','H6','TABLE','THEAD','TBODY','TR','TH','TD']);
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  const sanitizeNode = (node) => {
    // Remove disallowed elements
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName;
      if (!allowedTags.has(tag)) {
        const text = document.createTextNode(node.textContent || '');
        node.replaceWith(text);
        return; // replaced
      }
      // Attributes
      [...node.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on')) node.removeAttribute(attr.name);
        if (tag === 'A' && name === 'href') {
          const href = attr.value.trim();
          const allowed = href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:') || href.startsWith('#');
          if (!allowed) node.removeAttribute('href');
        } else if (tag !== 'A') {
          // remove any other attributes except basic global ones if present
          if (!['class','aria-label'].includes(name)) node.removeAttribute(attr.name);
        }
      });
      if (tag === 'A') {
        if (node.hasAttribute('href')) {
          node.setAttribute('target','_blank');
          node.setAttribute('rel','noopener noreferrer nofollow');
        }
      }
      if (tag === 'PRE') {
        if (!node.hasAttribute('aria-label')) node.setAttribute('aria-label','code block');
      }
    }
    // Recurse
    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      sanitizeNode(child);
      child = next;
    }
  };
  sanitizeNode(tmp);
  return tmp.innerHTML;
}

export function renderMarkdownToSafeHtml(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';
  const parts = splitCodeFences(markdown);
  const rendered = [];
  for (const p of parts) {
    if (p.type === 'codeblock') {
      rendered.push(`<pre aria-label="code block"><code>${escapeHtml(p.value)}</code></pre>`);
    } else {
      const blocks = groupBlocks(p.value);
      rendered.push(renderBlocksToHtml(blocks));
    }
  }
  const joined = rendered.join('');

  // Run autolinker to convert plain http(s) text into anchors (data-raw-href)
  const autolinked = autolinkHtml(joined);

  // Convert placeholder links with data-raw-href into real hrefs (before sanitization)
  const linkTmp = document.createElement('div');
  linkTmp.innerHTML = autolinked;
  linkTmp.querySelectorAll('a[data-raw-href]').forEach(a => {
    const raw = a.getAttribute('data-raw-href') || '';
    a.removeAttribute('data-raw-href');
    const href = String(raw).trim();
    // Enforce allowed schemes early: http(s), mailto, and fragment anchors
    const allowed = href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:') || href.startsWith('#');
    if (allowed) {
      a.setAttribute('href', href);
      // Pre-set safe navigation attributes; sanitizer will still verify later
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer nofollow');
    } else {
      // Do not set href for unsafe schemes; leave as plain text (sanitizer will finalize)
    }
  });
  const withHrefs = linkTmp.innerHTML;

  return sanitizeHtml(withHrefs);
}
