import { normalizeFileList, findFileByName } from '../files/listing.js';

export async function loadConversationsFromFiles(fileListOrArray) {
  const files = normalizeFileList(fileListOrArray);
  const entry = findFileByName(files, 'conversations.json');
  if (!entry) throw new Error('conversations.json not found');
  const text = await entry.file.text();
  return JSON.parse(text);
}
