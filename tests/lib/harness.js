export const resultsEl = document.getElementById('results');

function line(text, cls) {
  const div = document.createElement('div');
  if (cls) div.className = cls;
  div.textContent = text;
  resultsEl.appendChild(div);
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

export async function test(name, fn) {
  try {
    await fn();
    line(`✓ ${name}`, 'pass');
  } catch (err) {
    line(`✗ ${name} — ${err.message}`, 'fail');
    const pre = document.createElement('pre');
    pre.textContent = err.stack || String(err);
    resultsEl.appendChild(pre);
  }
}
