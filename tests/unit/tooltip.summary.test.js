import { test, assert } from '../lib/harness.js';
import { buildTooltipSummary } from '../../src/ui/tooltip.js';

const baseUser = {
  id: 'u-1',
  role: 'user',
  text: 'hello',
  meta: { nodeId: 'u-1', parentId: 'sys-0', contentType: 'text', createdTime: 1000 }
};

const baseAsst = {
  id: 'a-2',
  role: 'assistant',
  text: 'hi',
  meta: { nodeId: 'a-2', parentId: 'u-1', contentType: 'text', createdTime: 2000, modelSlug: 'gpt-5' }
};

test('buildTooltipSummary: user summary excludes model', () => {
  const s = buildTooltipSummary(baseUser);
  assert(s.role === 'user', 'role');
  assert(s.id === 'u-1', 'id');
  assert(s.parentId === 'sys-0', 'parentId');
  assert(s.contentType === 'text', 'contentType');
  assert(s.createdTime === 1000, 'createdTime');
  assert(!('modelSlug' in s), 'no model for user');
});

test('buildTooltipSummary: assistant summary includes model', () => {
  const s = buildTooltipSummary(baseAsst);
  assert(s.role === 'assistant', 'role');
  assert(s.id === 'a-2', 'id');
  assert(s.parentId === 'u-1', 'parentId');
  assert(s.contentType === 'text', 'contentType');
  assert(s.createdTime === 2000, 'createdTime');
  assert(s.modelSlug === 'gpt-5', 'modelSlug');
});
