// Minimal Markdown to safe HTML renderer
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
  const fence = /```([\s\S]*?)```/g; // non-greedy
  let lastIndex = 0;
  let m;
  while ((m = fence.exec(src))) {
    const before = src.slice(lastIndex, m.index);
    if (before) parts.push({ type: 'text', value: before });
    const code = m[1].replace(/^\n|\n$/g, '');
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
    }
  }
  return html.join('');
}

function sanitizeHtml(html) {
  const allowedTags = new Set(['P','BR','STRONG','EM','CODE','PRE','UL','OL','LI','A','H1','H2','H3','H4','H5','H6']);
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

  // Convert placeholder links with data-raw-href into real hrefs (before sanitization)
  const linkTmp = document.createElement('div');
  linkTmp.innerHTML = joined;
  linkTmp.querySelectorAll('a[data-raw-href]').forEach(a => {
    const href = a.getAttribute('data-raw-href') || '';
    a.removeAttribute('data-raw-href');
    a.setAttribute('href', href);
  });
  const withHrefs = linkTmp.innerHTML;

  return sanitizeHtml(withHrefs);
}
