import { test, assert } from '../lib/harness.js';
import { sortConversations, paginate } from '../../src/core/sortPaginate.js';

test('sortConversations: newest first by update_time then create_time', () => {
  const data = [
    { id: 'x', title: 'X', create_time: 1000 },
    { id: 'y', title: 'Y', create_time: 900, update_time: 5000 },
    { id: 'z', title: 'Z', create_time: 2000 },
  ];
  const sorted = sortConversations(data);
  assert(sorted[0].id === 'y', 'y has highest update_time');
  assert(sorted[1].id === 'z', 'z has higher create_time than x');
  assert(sorted[2].id === 'x', 'x is oldest');
});

test('paginate: returns correct slice and metadata', () => {
  const ids = Array.from({ length: 60 }, (_, i) => ({ id: String(i) }));
  const page1 = paginate(ids, 1, 25);
  assert(page1.items.length === 25, 'page size 25');
  assert(page1.total === 60, 'total 60');
  assert(page1.pages === 3, '3 pages');
  assert(page1.items[0].id === '0', 'first item id 0');
  const page3 = paginate(ids, 3, 25);
  assert(page3.items.length === 10, 'last page has 10 items');
  assert(page3.items[0].id === '50', 'first id on page 3 is 50');
});
