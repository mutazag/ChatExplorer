export function renderDetail(host, conversation) {
  host.innerHTML = '';
  if (!conversation) {
    const empty = document.createElement('p');
    empty.textContent = 'No conversation selected.';
    host.appendChild(empty);
    return;
  }
  if (!Array.isArray(conversation.messages)) {
    const empty = document.createElement('p');
    empty.textContent = 'This conversation has no messages.';
    host.appendChild(empty);
    return;
  }
  const msgs = [...conversation.messages].sort((a, b) => (a.create_time ?? 0) - (b.create_time ?? 0));
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-detail', '');
  for (const m of msgs) {
    const row = document.createElement('div');
    row.setAttribute('data-msg', '');
    row.className = 'msg';
    const role = document.createElement('strong');
    role.textContent = (m.role || 'unknown') + ': ';
    const text = document.createElement('span');
    text.textContent = m.text || '';
    row.appendChild(role);
    row.appendChild(text);
    wrapper.appendChild(row);
  }
  host.appendChild(wrapper);
}
