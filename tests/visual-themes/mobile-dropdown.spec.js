import { test, assert } from '../lib/harness.js';

test('visual-themes: mobile dropdown renders with conversations and selects current', () => {
  const picker = document.querySelector('[data-mobile-list]');
  assert(picker, 'mobile conversation picker exists');
  const sel = picker.querySelector('select');
  assert(sel && sel.options.length > 0, 'picker has options');
  const current = sel.value;
  // Selected option should match the select value
  const selectedOption = sel.options[sel.selectedIndex];
  assert(selectedOption && selectedOption.value === current, 'current option is selected');
});

 test('visual-themes: mobile dropdown change updates hash (triggers app selection)', () => {
  const picker = document.querySelector('[data-mobile-list]');
  const sel = picker.querySelector('select');
  const initialHash = location.hash;
  // If there's more than one option, switch to a different one to observe change
  if (sel.options.length > 1) {
    const newIndex = (sel.selectedIndex + 1) % sel.options.length;
    const newVal = sel.options[newIndex].value;
    sel.selectedIndex = newIndex;
    sel.dispatchEvent(new Event('change'));
    assert(location.hash.includes(newVal), 'location hash updated to new conversation id');
    // optional: restore previous selection for isolation
    sel.value = initialHash.replace('#id=', '') || sel.value;
  } else {
    // With single option, ensure change event does not throw and keeps hash consistent
    sel.dispatchEvent(new Event('change'));
    assert(location.hash === initialHash || location.hash.includes(sel.value), 'hash remains consistent after change');
  }
});
