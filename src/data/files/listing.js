export function normalizeFileList(fileListOrArray) {
  const arr = Array.from(fileListOrArray || []);
  return arr
    .filter(Boolean)
    .map((f) => ({
      name: f.name || '',
      path: (f.webkitRelativePath || f.name || '').replace(/\\/g, '/'),
      file: f,
    }));
}

export function findFileByName(files, nameLower) {
  const needle = String(nameLower).toLowerCase();
  return files.find((e) => (e.name || '').toLowerCase() === needle) || null;
}
