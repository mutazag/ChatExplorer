import { test, assert } from '../lib/harness.js';

function findMsg(selector) {
  return document.querySelector(`[data-detail] ${selector}`);
}

test('visual-themes: role bubbles and icons present', () => {
  // We assume the app renders detail for a selected conversation
  const userMsg = findMsg('.msg--user');
  const asstMsg = findMsg('.msg--assistant');
  assert(userMsg, 'has user message');
  assert(asstMsg, 'has assistant message');
  const userIcon = userMsg.querySelector('.msg-header img');
  const asstIcon = asstMsg.querySelector('.msg-header img');
  assert(userIcon && /user|human/i.test(userIcon.alt), 'user icon with accessible alt');
  assert(asstIcon && /assistant|robot/i.test(asstIcon.alt), 'assistant icon with accessible alt');
  const userBubble = userMsg.querySelector('.bubble');
  const asstBubble = asstMsg.querySelector('.bubble');
  assert(userBubble, 'user bubble exists');
  assert(asstBubble, 'assistant bubble exists');
});
