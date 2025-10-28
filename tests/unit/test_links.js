import { test, assert } from '../../tests/lib/harness.js';
import { autolinkHtml } from '../../src/utils/links.js';

test('autolinkHtml converts plain http(s) URLs to anchors with data-raw-href', () => {
  const input = '<p>Visit https://example.com for info</p>';
  const out = autolinkHtml(input);
  // Expect an anchor with data-raw-href
  assert(out.includes('data-raw-href="https://example.com"'), 'Expected data-raw-href anchor');
});

test('autolinkHtml does not autolink inside <code> elements', () => {
  const input = '<p>Here is code: <code>https://example.com</code></p>';
  const out = autolinkHtml(input);
  assert(out.includes('<code>https://example.com</code>'), 'Code content should be preserved without anchors');
});

test('autolinkHtml does not descend into existing <a> tags', () => {
  const input = '<p>Link: <a href="#">Click</a> https://example.com</p>';
  const out = autolinkHtml(input);
  // Should still have the existing anchor and add a new one for the plain URL
  assert(out.includes('<a href="#">Click</a>'), 'Existing anchor preserved');
  assert(out.includes('data-raw-href="https://example.com"'), 'Plain URL becomes data-raw-href anchor');
});
