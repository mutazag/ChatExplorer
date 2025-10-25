import { test, assert } from '../lib/harness.js';
import { renderDetail } from '../../src/ui/detailView.js';

const convo = {
  id: 'c1',
  messages: [
    { role: 'assistant', create_time: 2000, text: 'Hi' },
    { role: 'user', create_time: 1000, text: 'Hello' },
  ],
};

test('detailView: renders messages in chronological order with roles', () => {
  const host = document.createElement('div');
  renderDetail(host, convo);
  const rows = host.querySelectorAll('[data-msg]');
  assert(rows.length === 2, 'two messages rendered');
  assert(rows[0].textContent.includes('Hello'), 'older message first');
  assert(rows[1].textContent.includes('assistant'), 'role label present');
});
