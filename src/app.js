import { pickFolderOrFiles } from './features/folder/selectFolder.js';
import { loadConversationsFromFiles } from './data/conversations/loadConversationsFile.js';
import { normalizeConversationsWithWarnings } from './data/conversations/parse.js';
import { sortConversations } from './core/sortPaginate.js';
import { renderList } from './ui/listView.js';
import { renderDetail } from './ui/detailView.js';
import { renderStatusChip } from './ui/badges/statusChip.js';
import { on, getState, setConversations, setSelection, setPage } from './state/appState.js';
import { parseHash, setHashForId, onHashChange } from './router/hash.js';

const left = document.getElementById('left');
const right = document.getElementById('right');
const btnPick = document.getElementById('btn-pick');
const statusChip = document.getElementById('status-chip');
const errorLive = document.createElement('div');
errorLive.id = 'error-live';
errorLive.setAttribute('aria-live', 'polite');
errorLive.style.minHeight = '1rem';
document.body.prepend(errorLive);

on('conversations:changed', (s) => renderStatusChip(statusChip, s.stats));

btnPick.addEventListener('click', async () => {
  try {
    const files = await pickFolderOrFiles();
    const raw = await loadConversationsFromFiles(files);
    const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
    const sorted = sortConversations(normalized);
    setConversations(sorted, stats);
    draw();
  } catch (err) {
    errorLive.textContent = err.message || String(err);
  }
});

function draw() {
  const s = getState();
  renderList(
    left,
    s.conversations,
    { page: s.page, pageSize: s.pageSize, selectedId: s.selectedId },
    {
      onSelect: (id) => { setSelection(id); setHashForId(id); draw(); },
      onPage: (p) => { setPage(p); draw(); },
    }
  );
  const current = s.conversations.find((c) => String(c.id) === String(s.selectedId));
  renderDetail(right, current);
}

// Initialize from hash
const initial = parseHash();
if (initial.id) setSelection(initial.id);
onHashChange(({ id }) => { if (id) { setSelection(id); draw(); } });
