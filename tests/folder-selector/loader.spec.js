import { test, assert } from '../lib/harness.js';
import { loadConversationsFromFiles } from '../../src/data/conversations/loadConversationsFile.js';

class FakeFile {
  constructor(name, content) { this.name = name; this._content = content; }
  async text() { return this._content; }
}

test('loadConversationsFromFiles: parses conversations.json', async () => {
  const files = [ new FakeFile('conversations.json', JSON.stringify([{ id: '1', create_time: 1 }])) ];
  const data = await loadConversationsFromFiles(files);
  assert(Array.isArray(data), 'array parsed');
  assert(data[0].id === '1', 'first id ok');
});

test('loadConversationsFromFiles: throws when missing', async () => {
  let error = null;
  try { await loadConversationsFromFiles([ new FakeFile('foo.txt', 'x') ]); } catch (e) { error = e; }
  assert(!!error, 'should error');
});
