import { test, assert } from '../lib/harness.js';
import { renderDetail } from '../../src/ui/detailView.js';

function makeConvo() {
  return {
    id: 'c-1',
    messages: [
      { id: 'u-1', role: 'user', text: 'hi', create_time: 1000, meta: { nodeId: 'u-1', parentId: 'sys-0', contentType: 'text', createdTime: 1000 } },
      { id: 'a-2', role: 'assistant', text: 'hello', create_time: 2000, meta: { nodeId: 'a-2', parentId: 'u-1', contentType: 'text', createdTime: 2000, modelSlug: 'gpt-5' } },
    ]
  };
}

test('US6 tooltip: focus role icons to show tooltip with correct fields', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const c = makeConvo();
  renderDetail(host, c);

  const rows = host.querySelectorAll('[data-msg]');
  assert(rows.length === 2, 'two messages');
  // Find role icons (img in header)
  const userIcon = rows[0].querySelector('.msg-header img');
  const asstIcon = rows[1].querySelector('.msg-header img');
  assert(userIcon && asstIcon, 'icons exist');

  // Focus user icon
  userIcon.focus();
  await new Promise(r => requestAnimationFrame(r));
  const tip1 = document.querySelector('[data-tooltip][data-for="u-1"]');
  assert(tip1, 'user tooltip present');
  assert(tip1.textContent.includes('role') && tip1.textContent.includes('user'), 'contains role');
  assert(tip1.textContent.includes('contentType') && tip1.textContent.includes('text'), 'contains contentType');
  assert(!tip1.textContent.includes('modelSlug'), 'no modelSlug for user');

  // Focus assistant icon
  asstIcon.focus();
  await new Promise(r => requestAnimationFrame(r));
  const tip2 = document.querySelector('[data-tooltip][data-for="a-2"]');
  assert(tip2, 'assistant tooltip present');
  assert(tip2.textContent.includes('modelSlug') && tip2.textContent.includes('gpt-5'), 'model shown for assistant');
});
