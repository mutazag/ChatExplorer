import { toHuman } from '../utils/time.js';

function titleOrId(c) {
  const t = (c.title || '').trim();
  return t || String(c.id);
}

export function renderList(host, conversations, { page = 1, pageSize = 25, selectedId = null } = {}, onSelect = () => {}) {
  host.innerHTML = '';
  const total = conversations.length;
  if (!total) {
    const empty = document.createElement('p');
    empty.textContent = 'No conversations loaded.';
    host.appendChild(empty);
    return;
  }

  const start = (page - 1) * pageSize;
  const slice = conversations.slice(start, start + pageSize);
  const list = document.createElement('div');
  list.setAttribute('data-list', '');
  let focusIndex = 0;
  slice.forEach((c, idx) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.setAttribute('data-item', c.id);
    item.className = 'list-item' + (c.id === selectedId ? ' is-active' : '');
    item.textContent = `${titleOrId(c)} · ${toHuman(c.update_time ?? c.create_time)}`;
    item.tabIndex = c.id === selectedId ? 0 : -1;
    if (c.id === selectedId) focusIndex = idx;
    item.addEventListener('click', () => onSelect(String(c.id)));
    list.appendChild(item);
  });
  host.appendChild(list);

  // Simple pager
  const pager = document.createElement('div');
  pager.setAttribute('data-pager', '');
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const btnPrev = document.createElement('button');
  btnPrev.type = 'button';
  btnPrev.textContent = 'Prev';
  btnPrev.disabled = page <= 1;
  btnPrev.setAttribute('data-pager-prev', '');
  const btnNext = document.createElement('button');
  btnNext.type = 'button';
  btnNext.textContent = 'Next';
  btnNext.disabled = page >= pages;
  btnNext.setAttribute('data-pager-next', '');
  const label = document.createElement('span');
  label.textContent = ` Page ${page} / ${pages} `;
  pager.append(btnPrev, label, btnNext);
  host.appendChild(pager);

  // Keyboard navigation within current page
  host.addEventListener('keydown', (e) => {
    if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return;
    const items = host.querySelectorAll('[data-item]');
    if (!items.length) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusIndex = Math.max(0, focusIndex - 1);
      items[focusIndex].focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusIndex = Math.min(items.length - 1, focusIndex + 1);
      items[focusIndex].focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const el = items[focusIndex];
      if (el) el.click();
    }
  });

  // Pager events dispatch via onSelect of first/last items to keep draw() simple
  btnPrev.addEventListener('click', () => {
    const prevStart = Math.max(0, start - pageSize);
    const prevId = conversations[prevStart]?.id;
    onSelect(String(prevId ?? slice[0]?.id));
  });
  btnNext.addEventListener('click', () => {
    const nextStart = Math.min(total - 1, start + pageSize);
    const nextId = conversations[nextStart]?.id;
    onSelect(String(nextId ?? slice[slice.length - 1]?.id));
  });
}
