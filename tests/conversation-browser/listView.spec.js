import { test, assert } from '../lib/harness.js';
import { renderList } from '../../src/ui/listView.js';

const sample = [
  { id: '1', title: 'A', create_time: 1000 },
  { id: '2', title: 'B', create_time: 2000 },
  { id: '3', title: '', create_time: 3000 },
];

test('listView: renders page of items and fires select', () => {
  const host = document.createElement('div');
  let selected = null;
  renderList(host, sample, { page: 1, pageSize: 2, selectedId: null }, (id) => (selected = id));
  const items = host.querySelectorAll('[data-item]');
  assert(items.length === 2, 'renders two items for page size 2');
  assert(items[0].textContent.includes('A'), 'includes title A');
  items[1].click();
  assert(selected === '2', 'click selects id 2');
});

test('listView: title fallback uses identifier when title empty', () => {
  const host = document.createElement('div');
  renderList(host, sample, { page: 2, pageSize: 2, selectedId: null }, () => {});
  const items = host.querySelectorAll('[data-item]');
  assert(items[0].textContent.includes('3'), 'uses id "3" when title empty');
});
