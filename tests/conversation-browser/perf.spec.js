import { test, assert } from '../lib/harness.js';
import { sortConversations, paginate } from '../../src/core/sortPaginate.js';
import { renderList } from '../../src/ui/listView.js';

test('performance: sort + paginate + render first page under 1000ms for 1000 items', () => {
  const N = 1000;
  const data = Array.from({ length: N }, (_, i) => ({ id: String(i), title: 'T'+i, create_time: i }));
  const host = document.createElement('div');
  const t0 = performance.now();
  const sorted = sortConversations(data);
  const page = paginate(sorted, 1, 25);
  renderList(host, sorted, { page: 1, pageSize: 25, selectedId: sorted[0].id }, () => {});
  const t1 = performance.now();
  assert((t1 - t0) < 1000, `took ${(t1 - t0).toFixed(1)}ms`);
});
