// Unified dataset loading — HTTP discovery path and file-picker path.
// Both paths return { conversations, stats, files }.
import { discoverDatasets, fetchConversationsJson, listDatasetFiles } from './datasets/discovery.js';
import { loadConversationsFromFiles } from './conversations/loadConversationsFile.js';
import { normalizeConversationsWithWarnings } from './conversations/parse.js';
import { sortConversations } from '../core/sortPaginate.js';
import { startTimer } from '../utils/perfTimer.js';

// In-memory cache keyed by dataset path.
// Avoids re-fetching and re-normalizing the same dataset within a tab session.
const _cache = new Map();

// SessionStorage cache version — bump this when the data shape changes
// to invalidate stale cached indices across page reloads.
const SESSION_CACHE_VERSION = 'v1';
const SESSION_CACHE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB safety limit

function sessionKey(datasetPath) {
  return `ce_idx_${SESSION_CACHE_VERSION}_${datasetPath}`;
}

/**
 * Attempts to read a cached dataset index from sessionStorage.
 * Returns the parsed index object, or null on miss/error.
 * @param {string} path
 * @returns {object|null}
 */
function readSessionCache(path) {
  try {
    const raw = sessionStorage.getItem(sessionKey(path));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    // intentionally silent: sessionStorage may be unavailable or data may be corrupt
    return null;
  }
}

/**
 * Writes a dataset index to sessionStorage, respecting the 2 MB size guard.
 * @param {string} path
 * @param {{ conversations: Array, stats: object|null }} index
 */
function writeSessionCache(path, index) {
  try {
    const payload = JSON.stringify(index);
    if (payload.length > SESSION_CACHE_MAX_BYTES) {
      console.debug('[ChatExplorer] Session cache skipped: payload exceeds 2 MB limit');
      return;
    }
    sessionStorage.setItem(sessionKey(path), payload);
  } catch {
    // intentionally silent: QuotaExceededError or sessionStorage unavailable
  }
}

/**
 * Loads conversations from an HTTP-accessible dataset.
 * Checks sessionStorage first (survives page reload within the same tab),
 * then the in-memory cache, then fetches and normalizes from the server.
 * @param {object} dataset - { id, path, name? } descriptor
 * @returns {Promise<{ conversations: Array, stats: object|null, files: Array }>}
 */
export async function loadFromHttpDiscovery(dataset) {
  const key = dataset.path;

  // 1. In-memory cache (fastest — zero I/O)
  if (_cache.has(key)) {
    console.debug('[ChatExplorer] Memory cache hit for', key);
    return _cache.get(key);
  }

  // 2. SessionStorage index cache (survives page reload)
  const cached = readSessionCache(key);
  if (cached) {
    console.debug('[ChatExplorer] Session cache hit for', key);
    const result = { ...cached, files: [] }; // files not persisted (too large)
    _cache.set(key, result);
    return result;
  }

  // 3. Full fetch + normalise
  const stopTotal = startTimer(`load dataset "${dataset.id}"`);

  const stopFiles = startTimer('list dataset files');
  const files = await listDatasetFiles(dataset.path, { maxDepth: 2 });
  stopFiles();

  const stopFetch = startTimer('fetch conversations.json');
  const raw = await fetchConversationsJson(dataset.path);
  stopFetch();

  const stopNorm = startTimer('normalize conversations');
  const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
  stopNorm();

  const conversations = sortConversations(normalized);
  const result = { conversations, stats, files };

  // Persist slim index to sessionStorage (conversations list only, no message content)
  const slimIndex = {
    conversations: conversations.map(c => ({
      id: c.id,
      title: c.title,
      update_time: c.update_time,
      messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
    })),
    stats,
  };
  writeSessionCache(key, slimIndex);

  _cache.set(key, result);
  stopTotal();

  return result;
}

/**
 * Loads conversations from a user-provided FileList (file picker / drag-drop).
 * Not cached — always fresh from the picked files.
 * @param {FileList|Array} fileList
 * @returns {Promise<{ conversations: Array, stats: object|null, files: Array }>}
 */
export async function loadFromFilePicker(fileList) {
  const stopTotal = startTimer('load from file picker');
  const raw = await loadConversationsFromFiles(fileList);
  const fileArray = Array.from(fileList);
  const { normalized, stats } = normalizeConversationsWithWarnings(raw, fileArray);
  const conversations = sortConversations(normalized);
  stopTotal();
  return { conversations, stats, files: fileArray };
}

/**
 * Discovers available HTTP datasets.
 * Thin re-export for a consistent import path.
 * @returns {Promise<Array>} List of dataset descriptors
 */
export { discoverDatasets };

/**
 * Clears in-memory and sessionStorage caches.
 * Useful in tests or to force a reload after data has changed.
 */
export function clearCache() {
  _cache.clear();
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('ce_idx_')) keysToRemove.push(k);
    }
    for (const k of keysToRemove) sessionStorage.removeItem(k);
  } catch {
    // intentionally silent: sessionStorage may be unavailable
  }
}
