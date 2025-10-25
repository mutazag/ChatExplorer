import { discoverDatasets } from '../../data/datasets/discovery.js';

export async function pickFolderOrFiles() {
  // Deprecated for this feature: keep legacy fallback when discovery yields no results
  const legacyFallback = () => new Promise((resolve) => {
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

  try {
    const datasets = await discoverDatasets();
    // Always return sentinel (even if empty) so caller can render empty state per spec
    return { __datasets__: datasets };
  } catch (_) { /* ignore and fall back */ }

  // Try File System Access API as a last resort for legacy usage
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

  return legacyFallback();
}

export function renderDatasetChoices(container, datasets, { onChoose, activeId } = {}) {
  container.innerHTML = '';
  const list = document.createElement('ul');
  list.setAttribute('role', 'listbox');
  list.className = 'dataset-list';
  datasets.forEach((d, idx) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.tabIndex = idx === 0 ? 0 : -1;
    if (activeId && String(activeId) === String(d.id)) li.classList.add('is-active');
    // Build item content: icon, name, time
    const row = document.createElement('div');
    row.className = 'dataset-item';
    const icon = document.createElement('img');
    icon.src = 'assets/folder.svg';
    icon.alt = '';
    icon.className = 'icon';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = d.name || d.id;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = d.timeLabel || 'Unknown';
    meta.setAttribute('aria-label', `Last modified ${d.timeLabel || 'Unknown'}`);
    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(meta);
    li.appendChild(row);
    li.dataset.id = d.id;
    li.addEventListener('click', () => {
      // Immediate visual feedback
      list.querySelectorAll('[role="option"].is-active').forEach(el => el.classList.remove('is-active'));
      li.classList.add('is-active');
      onChoose(d);
    });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChoose(d); }
    });
    list.appendChild(li);
  });
  // Keyboard navigation across options
  list.addEventListener('keydown', (e) => {
    const options = Array.from(list.querySelectorAll('[role="option"]'));
    const currentIndex = options.findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = options[Math.min(options.length - 1, Math.max(0, currentIndex + 1))] || options[0];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = options[Math.max(0, Math.min(options.length - 1, currentIndex - 1))] || options[0];
      prev.focus();
    }
  });
  container.appendChild(list);
}

export function renderEmptyDatasets(container, { onBrowseClick } = {}) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = 'No datasets found under /data';
  const p = document.createElement('p');
  p.textContent = 'Add a folder like data/my-export with a conversations.json, or browse local files.';
  wrap.appendChild(title);
  wrap.appendChild(p);
  if (onBrowseClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Browse local export…';
    btn.addEventListener('click', onBrowseClick);
    wrap.appendChild(btn);
  }
  container.appendChild(wrap);
}

export function browseFilesLegacy() {
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
