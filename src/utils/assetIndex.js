// Build and query an index over selected export files for asset pointer resolution

function toRelPath(f) {
  if (!f) return '';
  if (typeof f === 'string') return String(f).replace(/\\/g, '/');
  const p = (f.webkitRelativePath || f.path || f.name) || '';
  return String(p).replace(/\\/g, '/');
}

function basename(p) {
  const i = p.lastIndexOf('/');
  return i >= 0 ? p.slice(i + 1) : p;
}

function startsWithBasename(p, prefix) {
  return basename(p).toLowerCase().startsWith(prefix.toLowerCase());
}

function sortDeterministic(paths) {
  // Shortest basename first, then lexicographic full path
  return [...paths].sort((a, b) => {
    const ba = basename(a), bb = basename(b);
    if (ba.length !== bb.length) return ba.length - bb.length;
    return a.localeCompare(b);
  });
}

export function buildAssetIndex(filesArray) {
  const relPaths = Array.from(filesArray || [])
    .map(toRelPath)
    .filter(Boolean);

  function findAnywhereByPrefix(prefix) {
    const matches = relPaths.filter((p) => startsWithBasename(p, prefix));
    return sortDeterministic(matches);
  }

  function findUnderConversation(convId, subdir, prefix) {
    const needle = `/${convId}/${subdir}/`;
    const matches = relPaths.filter((p) => p.includes(needle) && startsWithBasename(p, prefix));
    return sortDeterministic(matches);
  }

  function findUnderUserFolders(prefix) {
    const matches = relPaths.filter((p) => p.includes('/user-') && startsWithBasename(p, prefix));
    return sortDeterministic(matches);
  }

  function resolvePointer(pointer, context) {
    // pointer: { scheme, id, rawPrefix } where rawPrefix includes file- or file_
    // context: { conversationId, kind }
    if (!pointer || !pointer.rawPrefix) return [];
    const prefix = pointer.rawPrefix;
    const conv = context && context.conversationId;
    const kind = context && context.kind;

    // Kind-priority search when conversationId provided
    if (conv && kind === 'audio') {
      const a = findUnderConversation(conv, 'audio', prefix);
      if (a.length) return a;
    }
    if (conv && kind === 'video') {
      const v = findUnderConversation(conv, 'video', prefix);
      if (v.length) return v;
    }

    // Scheme-specific fallbacks
    if (pointer.scheme === 'file-service') {
      // Images often live at root or under user-*; prefer user-* for generated content
      if (kind === 'image') {
        const user = findUnderUserFolders(prefix);
        if (user.length) return user;
      }
      return findAnywhereByPrefix(prefix);
    }
    if (pointer.scheme === 'sediment') {
      // Underscore variant — frequently audio/video containers in conv folders.
      if (conv) {
        const av = [
          ...findUnderConversation(conv, 'audio', prefix),
          ...findUnderConversation(conv, 'video', prefix),
        ];
        if (av.length) return av;
      }
      return findAnywhereByPrefix(prefix);
    }

    // Generic fallback path
    if (conv) {
      const av = [
        ...findUnderConversation(conv, 'audio', prefix),
        ...findUnderConversation(conv, 'video', prefix),
      ];
      if (av.length) return av;
    }
    const user = findUnderUserFolders(prefix);
    if (user.length) return user;
    return findAnywhereByPrefix(prefix);
  }

  return {
    resolvePointer,
  };
}

export function parseAssetPointer(raw) {
  // Examples:
  //  file-service://file-1Cym1FWd...
  //  sediment://file_00000000...
  if (typeof raw !== 'string') return null;
  const lower = raw.toLowerCase();
  const i = lower.indexOf('://');
  if (i < 0) {
    // Treat as bare prefix
    return { scheme: 'unknown', id: lower, rawPrefix: lower };
  }
  const scheme = lower.slice(0, i);
  const rest = raw.slice(i + 3); // preserve original case for prefix match robustness
  // rest should start with file- or file_
  const rawPrefix = rest; // we want the leading file-*/file_* as part of prefix
  const id = rest.replace(/^file[-_]/i, '');
  return { scheme, id, rawPrefix };
}
