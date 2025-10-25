import { pickFolderOrFiles } from './features/folder/selectFolder.js';
import { loadConversationsFromFiles } from './data/conversations/loadConversationsFile.js';
import { normalizeConversations } from './data/conversations/parse.js';
import { sortConversations } from './core/sortPaginate.js';
import { renderList } from './ui/listView.js';
import { renderDetail } from './ui/detailView.js';
import { renderModelBadge } from './ui/badges/modelBadge.js';
import { on, getState, setConversations, setSelection, setPage, loadPersisted } from './state/appState.js';
import { mountSettings } from './ui/settingsPanel.js';

const left = document.getElementById('left');
const right = document.getElementById('right');
const btnPick = document.getElementById('btn-pick');
const btnSettings = document.getElementById('btn-settings');
const modelBadge = document.getElementById('model-badge');
const dialog = document.getElementById('settings-dialog');

loadPersisted();
renderModelBadge(modelBadge, getState());

on('model:changed', (s) => renderModelBadge(modelBadge, s));

mountSettings(dialog);
btnSettings.addEventListener('click', () => {
  mountSettings(dialog);
  dialog.showModal();
});

btnPick.addEventListener('click', async () => {
  try {
    const files = await pickFolderOrFiles();
    const raw = await loadConversationsFromFiles(files);
    const normalized = normalizeConversations(raw);
    const sorted = sortConversations(normalized);
    setConversations(sorted);
    draw();
  } catch (err) {
    alert(err.message || String(err));
  }
});

function draw() {
  const s = getState();
  renderList(left, s.conversations, { page: s.page, pageSize: s.pageSize, selectedId: s.selectedId }, (id) => {
    setSelection(id);
    draw();
  });
  const current = s.conversations.find((c) => String(c.id) === String(s.selectedId));
  renderDetail(right, current);
}
