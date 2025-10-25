import { test, assert } from '../lib/harness.js';
import { normalizeConversations } from '../../src/data/conversations/parse.js';

test('normalizeConversations: uses conversation_id and title fallback', () => {
  const mapping = {};
  const rootId = 'n1';
  mapping[rootId] = { id: rootId, parent: null, children: ['n2'], message: { author: { role: 'user' }, create_time: 1000, content: { content_type: 'text', parts: ['Hello'] }, metadata: {} } };
  mapping['n2'] = { id: 'n2', parent: rootId, children: [], message: { author: { role: 'assistant' }, create_time: 2000, content: { content_type: 'text', parts: ['Hi'] }, metadata: {} } };
  const input = [
    { conversation_id: 'c-123', title: null, create_time: 1000, update_time: 2000, mapping, current_node: 'n2' },
    { title: 'no id', create_time: 1100 }, // invalid: no conversation_id
  ];
  const out = normalizeConversations(input);
  assert(Array.isArray(out), 'output should be array');
  assert(out.length === 1, 'should include only conversations with conversation_id');
  const c = out[0];
  assert(c.id === 'c-123', 'id comes from conversation_id');
  assert(c.title === 'c-123', 'title falls back to conversation_id');
  assert(Array.isArray(c.messages) && c.messages.length === 2, 'active path reconstructed');
  assert(c.messages[0].text === 'Hello', 'older message first');
  assert(c.messages[1].role === 'assistant', 'role preserved');
});

test('normalizeConversations: omits visually hidden system scaffolding', () => {
  const mapping = {};
  const r = 'r';
  const s = 's';
  const u = 'u';
  mapping[r] = { id: r, parent: null, children: [s], message: null };
  mapping[s] = { id: s, parent: r, children: [u], message: { author: { role: 'system' }, create_time: 900, content: { content_type: 'text', parts: [''] }, metadata: { is_visually_hidden_from_conversation: true } } };
  mapping[u] = { id: u, parent: s, children: [], message: { author: { role: 'user' }, create_time: 1000, content: { content_type: 'text', parts: ['Q'] }, metadata: {} } };
  const input = [ { conversation_id: 'c-1', title: 'T', create_time: 900, update_time: 1000, mapping, current_node: u } ];
  const out = normalizeConversations(input);
  const msgs = out[0].messages;
  assert(msgs.length === 1, 'hidden system message omitted');
  assert(msgs[0].role === 'user' && msgs[0].text === 'Q', 'kept user message');
});
