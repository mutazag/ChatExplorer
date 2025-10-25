import { test, assert } from '../lib/harness.js';
import { renderList } from '../../src/ui/listView.js';

test('integration: paging moves through 60 items by 25s', () => {
  const data = Array.from({ length: 60 }, (_, i) => ({ id: String(i+1), title: 'T'+(i+1), create_time: i }));
  const host = document.createElement('div');
  let page = 1;
  renderList(host, data, { page, pageSize: 25, selectedId: null }, { onSelect: () => {}, onPage: (p) => { page = p; } });
  const next = host.querySelector('[data-pager-next]');
  next.click();
  assert(page === 2, 'moved to page 2');
  // re-render page 2
  renderList(host, data, { page, pageSize: 25, selectedId: null }, { onSelect: () => {}, onPage: (p) => { page = p; } });
  const items2 = host.querySelectorAll('[data-item]');
  assert(items2.length === 25, 'page 2 has 25');
  next.click(); // to page 3
  assert(page === 3, 'moved to page 3');
  renderList(host, data, { page, pageSize: 25, selectedId: null }, { onSelect: () => {}, onPage: (p) => { page = p; } });
  const items3 = host.querySelectorAll('[data-item]');
  assert(items3.length === 10, 'page 3 has 10');
});
