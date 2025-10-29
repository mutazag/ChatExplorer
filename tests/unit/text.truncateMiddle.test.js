import { test, assert } from '../lib/harness.js';

import { truncateMiddle } from '../../src/utils/text.js';

test('truncateMiddle: returns input when length <= max', () => {
  const s = 'abcdefgh';
  const out = truncateMiddle(s, 10);
  assert(out === s, 'should return original when under max');
});

test('truncateMiddle: truncates long strings with middle ellipsis', () => {
  const s = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const out = truncateMiddle(s, 20);
  assert(out.length <= 20, 'output within max');
  assert(out.includes('…') || out.includes('...'), 'has ellipsis');
  assert(out.startsWith('0123'), 'keeps head context');
  assert(/Z$/.test(out) || /Y$/.test(out), 'keeps tail context');
});

test('truncateMiddle: handles edge values and non-strings', () => {
  assert(truncateMiddle(null, 5) === '', 'null -> empty string');
  assert(truncateMiddle(undefined, 5) === '', 'undefined -> empty string');
  assert(truncateMiddle(12345, 3).length <= 3, 'non-strings coerced and truncated');
});
