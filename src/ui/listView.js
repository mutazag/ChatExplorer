import { toHuman } from '../utils/time.js';

function titleOrId(c) {
  const t = (c.title || '').trim();
  return t || String(c.id);
}

export function renderList(host, conversations, { page = 1, pageSize = 25, selectedId = null } = {}, onSelect = () => {}) {
  host.innerHTML = '';
  const start = (page - 1) * pageSize;
  const slice = conversations.slice(start, start + pageSize);
  const list = document.createElement('div');
  list.setAttribute('data-list', '');
  for (const c of slice) {
    const item = document.createElement('button');
    item.type = 'button';
    item.setAttribute('data-item', c.id);
    item.className = 'list-item' + (c.id === selectedId ? ' is-active' : '');
    item.textContent = `${titleOrId(c)} · ${toHuman(c.update_time ?? c.create_time)}`;
    item.addEventListener('click', () => onSelect(String(c.id)));
    list.appendChild(item);
  }
  host.appendChild(list);
}
