import { test, assert } from '../../tests/lib/harness.js';
import { renderMarkdownToSafeHtml } from '../../src/utils/markdown.js';

test('renderMarkdownToSafeHtml does not produce href for javascript: links', () => {
  const out = renderMarkdownToSafeHtml('[X](javascript:alert(1))');
  // Should not produce a clickable href attribute
  assert(!/href="javascript:/i.test(out), 'javascript: href should be removed');
});

test('renderMarkdownToSafeHtml produces anchors for plain https URLs with rel/target', () => {
  const out = renderMarkdownToSafeHtml('Visit https://example.com');
  assert(/<a[^>]+href="https:\/\/example.com"/i.test(out), 'Expected href to example.com');
  assert(/target="_blank"/i.test(out), 'Expected target="_blank" on anchor');
  assert(/rel="[^"]*noopener[^"]*"/i.test(out), 'Expected rel to include noopener');
});
