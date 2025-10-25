import { test, assert } from '../lib/harness.js';
import { normalizeFileList, findFileByName } from '../../src/data/files/listing.js';

test('normalizeFileList: maps FileList to array with names', () => {
  const f = (name) => ({ name, text: async () => '' });
  const list = normalizeFileList([f('a.txt'), f('conversations.json')]);
  assert(Array.isArray(list), 'output is array');
  assert(list.length === 2, 'has two');
  assert(list[1].name === 'conversations.json', 'keeps name');
});

test('findFileByName: finds conversations.json', () => {
  const files = normalizeFileList([{ name: 'foo' }, { name: 'conversations.json' }]);
  const hit = findFileByName(files, 'conversations.json');
  assert(!!hit, 'found');
  assert(hit.name === 'conversations.json', 'correct item');
});
