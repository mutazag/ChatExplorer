import { test, assert } from '../lib/harness.js';
import { renderMarkdownToSafeHtml } from '../../src/utils/markdown.js';

function htmlToNode(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

test('markdown: basic inline elements render', () => {
  const html = renderMarkdownToSafeHtml('**bold** and *em* and `code` and [link](https://example.com)');
  const node = htmlToNode(html);
  assert(node.querySelector('strong'), 'bold -> strong');
  assert(node.querySelector('em'), 'italic -> em');
  assert(node.querySelector('code'), 'inline code -> code');
  const a = node.querySelector('a[href="https://example.com"],a[href="https://example.com/"]');
  assert(a, 'link rendered');
  assert(a.target === '_blank', 'link opens in new tab');
  assert(a.rel && a.rel.includes('noopener') && a.rel.includes('noreferrer') && a.rel.includes('nofollow'), 'safe rel');
});

test('markdown: fenced code block preserved and labeled', () => {
  const html = renderMarkdownToSafeHtml('````\nline1\n  line2\n````');
  const node = htmlToNode(html);
  const pre = node.querySelector('pre');
  assert(pre, 'has pre');
  assert(pre.getAttribute('aria-label') === 'code block', 'pre has aria-label');
  const code = node.querySelector('pre > code');
  assert(code && code.textContent.includes('line1') && code.textContent.includes('  line2'), 'code preserves whitespace');
});

test('markdown: lists and headings render', () => {
  const md = '# Title\n\n- one\n- two\n\n1. first\n2. second';
  const html = renderMarkdownToSafeHtml(md);
  const node = htmlToNode(html);
  assert(node.querySelector('h1'), 'h1 rendered');
  assert(node.querySelector('ul li'), 'unordered list rendered');
  assert(node.querySelector('ol li'), 'ordered list rendered');
});

test('markdown: sanitizer strips scripts and javascript URLs', () => {
  const md = 'Bad [x](javascript:alert(1)) <script>alert(1)</script>';
  const html = renderMarkdownToSafeHtml(md);
  const node = htmlToNode(html);
  assert(!node.querySelector('script'), 'no script tags');
  assert(!node.querySelector('a[href^="javascript:"]'), 'no javascript: hrefs');
});

test('markdown: plain text fallback paragraphs and escaping', () => {
  const md = 'Hello <b>world</b>\nSecond line';
  const html = renderMarkdownToSafeHtml(md);
  const node = htmlToNode(html);
  assert(node.querySelector('p'), 'paragraph rendered');
  assert(node.textContent.includes('Hello') && node.textContent.includes('Second line'), 'content present');
  assert(!node.querySelector('b'), 'embedded HTML is escaped, not rendered');
});

test('markdown: ordered list supports multi-digit numbering', () => {
  const md = '10. ten\n11. eleven\n12. twelve';
  const html = renderMarkdownToSafeHtml(md);
  const node = htmlToNode(html);
  const ol = node.querySelector('ol');
  assert(ol, 'ordered list rendered for multi-digit indexes');
  const items = ol ? ol.querySelectorAll('li') : [];
  assert(items.length === 3, 'contains three list items');
  const texts = Array.from(items).map(li => li.textContent.trim());
  assert(texts[0] === 'ten' && texts[1] === 'eleven' && texts[2] === 'twelve', 'items preserve content order');
});

test('markdown: GFM table renders with alignment and inline formatting', () => {
  const md = `| Col A | Col B |\n| :--- | ---: |\n| **bold** | right |\n| item | *em* |`;
  const html = renderMarkdownToSafeHtml(md);
  const node = htmlToNode(html);
  const table = node.querySelector('table');
  assert(table, 'table element rendered');
  const ths = node.querySelectorAll('thead th');
  assert(ths.length === 2, 'two header columns');
  assert(ths[0].classList.contains('align-left'), 'first column left-aligned');
  assert(ths[1].classList.contains('align-right'), 'second column right-aligned');
  // body
  const rows = node.querySelectorAll('tbody tr');
  assert(rows.length === 2, 'two body rows');
  const firstBold = rows[0].querySelector('td:first-child strong');
  assert(firstBold, 'inline formatting inside table cell (bold)');
  const secondEm = rows[1].querySelector('td:last-child em');
  assert(secondEm, 'inline formatting inside table cell (italic)');
});
