import { test, assert } from '../lib/harness.js';
import { normalizeConversations } from '../../src/data/conversations/parse.js';

function makeConv() {
  const userId = 'u-1';
  const asstId = 'a-2';
  return {
    conversation_id: 'conv-1',
    current_node: asstId,
    mapping: {
      'client-created-root': { id: 'client-created-root', message: null, parent: null, children: ['sys-0'] },
      'sys-0': {
        id: 'sys-0',
        parent: 'client-created-root',
        children: [userId],
        message: { id: 'sys-0', author: { role: 'system' }, content: { content_type: 'text', parts: [''] }, metadata: { is_visually_hidden_from_conversation: true } }
      },
      [userId]: {
        id: userId,
        parent: 'sys-0',
        children: [asstId],
        message: {
          id: userId,
          author: { role: 'user' },
          create_time: 1000,
          content: { content_type: 'text', parts: ['hello'] },
          metadata: { request_id: 'R-'.padEnd(60, 'x') }
        }
      },
      [asstId]: {
        id: asstId,
        parent: userId,
        children: [],
        message: {
          id: asstId,
          author: { role: 'assistant' },
          create_time: 2000,
          content: { content_type: 'text', parts: ['hi'] },
          metadata: { model_slug: 'gpt-5', default_model_slug: 'gpt-5' }
        }
      }
    }
  };
}

test('normalizeConversations: enriches message meta for tooltip mapping', () => {
  const c = makeConv();
  const out = normalizeConversations([c]);
  assert(out.length === 1, 'one conversation');
  assert(out[0].messages.length === 2, 'two visible messages');
  const [mUser, mAsst] = out[0].messages;
  // User
  assert(mUser.meta, 'user meta exists');
  assert(mUser.meta.nodeId === 'u-1', 'nodeId maps');
  assert(mUser.meta.parentId === 'sys-0', 'parentId from mapping');
  assert(mUser.meta.contentType === 'text', 'captures content type');
  assert(mUser.meta.createdTime === 1000, 'captures created time');
  assert(!mUser.meta.modelSlug, 'no model for user');
  // Assistant
  assert(mAsst.meta, 'assistant meta exists');
  assert(mAsst.meta.nodeId === 'a-2', 'nodeId maps');
  assert(mAsst.meta.parentId === 'u-1', 'parentId from mapping');
  assert(mAsst.meta.modelSlug === 'gpt-5', 'captures model slug');
});
