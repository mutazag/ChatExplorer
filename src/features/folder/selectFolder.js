export async function pickFolderOrFiles() {
  // Try File System Access API first
  if (window.showDirectoryPicker) {
    const handle = await window.showDirectoryPicker();
    const files = [];
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        files.push(file);
      }
    }
    return files;
  }

  // Fallback: input directory or multi-file
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.setAttribute('webkitdirectory', '');
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      const files = Array.from(input.files || []);
      document.body.removeChild(input);
      resolve(files);
    });
    input.click();
  });
}
