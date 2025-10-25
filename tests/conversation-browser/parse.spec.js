import { test, assert } from '../lib/harness.js';
import { normalizeConversations } from '../../src/data/conversations/parse.js';

test('normalizeConversations: maps minimal fields and filters invalid', () => {
  const input = [
    { id: 'a1', title: 'Hello', create_time: 1000, update_time: 2000, mapping: 1 },
    { id: 'a2', create_time: 1500 }, // missing title is allowed
    { title: 'no id', create_time: 1100 }, // invalid, no id
  ];
  const out = normalizeConversations(input);
  assert(Array.isArray(out), 'output should be array');
  assert(out.length === 2, 'should include 2 valid conversations');
  assert(out[0].id === 'a1', 'preserve id');
  assert('title' in out[1], 'title field should exist (possibly empty)');
});
