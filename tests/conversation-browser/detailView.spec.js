import { test, assert } from '../lib/harness.js';
import { renderDetail } from '../../src/ui/detailView.js';

const convo = {
  id: 'c1',
  messages: [
    { role: 'assistant', create_time: 2000, text: 'Hi' },
    { role: 'user', create_time: 1000, text: 'Hello' },
  ],
};

test('detailView: renders messages in chronological order with roles', () => {
  const host = document.createElement('div');
  renderDetail(host, convo);
  const rows = host.querySelectorAll('[data-msg]');
  assert(rows.length === 2, 'two messages rendered');
  assert(rows[0].textContent.includes('Hello'), 'older message first');
  assert(rows[1].textContent.includes('assistant'), 'role label present');
});

test('detailView: renders basic Markdown safely', () => {
  const host = document.createElement('div');
  const mdConvo = {
    id: 'c2',
    messages: [
      {
        role: 'assistant',
        create_time: 1000,
        text: '# Title\n\n**bold** and `code`\n\n- one\n- two\n\nSee [site](https://example.com)'
      }
    ]
  };
  renderDetail(host, mdConvo);
  const row = host.querySelector('[data-msg]');
  assert(row, 'one message rendered');
  // heading, bold, code, list, and anchor should exist
  assert(row.querySelector('h1'), 'renders heading');
  assert(row.querySelector('strong'), 'renders bold');
  assert(row.querySelector('code'), 'renders code');
  assert(row.querySelector('ul li'), 'renders list');
  const a = row.querySelector('a[href="https://example.com/"] , a[href="https://example.com"]');
  assert(a, 'renders link');
  assert(a.target === '_blank', 'link opens in new tab');
  assert(a.rel && a.rel.includes('noopener') && a.rel.includes('noreferrer') && a.rel.includes('nofollow'), 'link has safe rel');
});

test('detailView: sanitizes scripts and javascript URLs', () => {
  const host = document.createElement('div');
  const bad = {
    id: 'c3',
    messages: [
      {
        role: 'assistant',
        create_time: 1000,
        text: 'click [me](javascript:alert(1)) <script>evil()</script>'
      }
    ]
  };
  renderDetail(host, bad);
  const row = host.querySelector('[data-msg]');
  assert(row, 'one message rendered');
  assert(!row.querySelector('script'), 'no script tags');
  const badLink = row.querySelector('a[href^="javascript:"]');
  assert(!badLink, 'no javascript: links');
});

test('detailView: plain text fallback and code block aria', () => {
  const host = document.createElement('div');
  const c = {
    id: 'c4',
    messages: [
      { role: 'user', create_time: 1000, text: 'Hello\nWorld' },
      { role: 'assistant', create_time: 2000, text: '```\nline\n```' },
    ]
  };
  renderDetail(host, c);
  const rows = host.querySelectorAll('[data-msg]');
  assert(rows.length === 2, 'two messages');
  const p = rows[0].querySelector('p');
  assert(p, 'plain text becomes paragraph');
  const pre = rows[1].querySelector('pre');
  assert(pre, 'code block present');
  assert(pre.getAttribute('aria-label') === 'code block', 'pre has aria-label');
});
