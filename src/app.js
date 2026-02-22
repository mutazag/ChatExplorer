import { pickFolderOrFiles, renderDatasetChoices, renderEmptyDatasets, browseFilesLegacy } from './features/folder/selectFolder.js';
import { discoverDatasets, fetchConversationsJson, listDatasetFiles } from './data/datasets/discovery.js';
import { loadConversationsFromFiles } from './data/conversations/loadConversationsFile.js';
import { normalizeConversationsWithWarnings } from './data/conversations/parse.js';
import { sortConversations } from './core/sortPaginate.js';
import { renderList } from './ui/listView.js';
import { renderDetail } from './ui/detailView.js';
import { renderStatusChip } from './ui/badges/statusChip.js';
import { on, getState, setConversations, setSelection, setPage, setSelectedDataset } from './state/appState.js';
import { onActiveDataSetChanged } from './state/events.js';
import { initThemeToggle, initPaneToggle } from './ui/controls.js';
import { parseHash, setHashForId, onHashChange } from './router/hash.js';

// Side-effect imports: initialises lightbox, a11y helpers, and media resolver
import './bootstrap.js';

const left = document.getElementById('left');
const right = document.getElementById('right');
const btnPick = document.getElementById('btn-pick');
const btnChangeDataset = document.getElementById('btn-change-dataset');
const btnTheme = document.getElementById('btn-theme');
const btnPane = document.getElementById('btn-pane');
const statusChip = document.getElementById('status-chip');
const errorLive = document.createElement('div');
errorLive.id = 'error-live';
errorLive.setAttribute('aria-live', 'polite');
errorLive.style.minHeight = '1rem';
document.body.prepend(errorLive);

on('conversations:changed', (s) => {
  renderStatusChip(statusChip, s.stats);
  updateControlsVisibility();
});
on('dataset:selected', () => {
  updateControlsVisibility();
});

function updateControlsVisibility() {
  try {
    const s = getState();
    const hasSelection = !!(s.selectedDataset || (Array.isArray(s.conversations) && s.conversations.length > 0));
    if (btnPick) btnPick.hidden = hasSelection; // Hide select after first successful selection
    if (btnChangeDataset) btnChangeDataset.hidden = !hasSelection; // Show change button when we have an active dataset
  } catch { /* intentionally silent: DOM may not be fully initialised */ }
}

function ensureLeftVisible(show = true) {
  try {
    const root = document.documentElement; // .show-left .left { display:block } under mobile CSS
    if (!root) return;
    if (show) root.classList.add('show-left'); else root.classList.remove('show-left');
  } catch { /* intentionally silent: classList manipulation is non-critical */ }
}

btnPick.addEventListener('click', async () => {
  try {
    const filesOrDatasets = await pickFolderOrFiles();
    if (filesOrDatasets && filesOrDatasets.__datasets__) {
      // Show dataset choices in the left pane
      const datasets = filesOrDatasets.__datasets__;
      if (datasets.length === 0) {
        ensureLeftVisible(true);
        renderEmptyDatasets(left, {
          onBrowseClick: async () => {
            const files = await browseFilesLegacy();
            const raw = await loadConversationsFromFiles(files);
            const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
            const sorted = sortConversations(normalized);
            setConversations(sorted, stats);
            draw();
            ensureLeftVisible(false);
          }
        });
      } else if (datasets.length === 1) {
        // Auto-load single dataset
        setSelectedDataset(datasets[0]);
        const raw = await fetchConversationsJson(datasets[0].path);
        const files = await listDatasetFiles(datasets[0].path, { maxDepth: 2 });
        const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
        const sorted = sortConversations(normalized);
        setConversations(sorted, stats);
        draw();
        updateControlsVisibility();
      } else {
        ensureLeftVisible(true);
        renderDatasetChoices(left, datasets, {
          activeId: getState().selectedDataset?.id,
          onChoose: async (d) => {
            setSelectedDataset(d);
            const raw = await fetchConversationsJson(d.path);
            const files = await listDatasetFiles(d.path, { maxDepth: 2 });
            const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
            const sorted = sortConversations(normalized);
            setConversations(sorted, stats);
            draw();
            updateControlsVisibility();
            ensureLeftVisible(false);
          }
        });
      }
      return;
    }

    // Legacy flow: user-picked files
    const files = filesOrDatasets;
    const raw = await loadConversationsFromFiles(files);
    const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
    const sorted = sortConversations(normalized);
    setConversations(sorted, stats);
    draw();
    updateControlsVisibility();
    ensureLeftVisible(false);
  } catch (err) {
    errorLive.textContent = err.message || String(err);
  }
});

async function showDatasetChooser() {
  try {
    const datasets = await discoverDatasets();
    if (datasets.length === 0) {
      ensureLeftVisible(true);
      renderEmptyDatasets(left, {
        onBrowseClick: async () => {
          const files = await browseFilesLegacy();
          const raw = await loadConversationsFromFiles(files);
          const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
          const sorted = sortConversations(normalized);
          setConversations(sorted, stats);
          draw();
          updateControlsVisibility();
          ensureLeftVisible(false);
        }
      });
    } else if (datasets.length === 1) {
      setSelectedDataset(datasets[0]);
      const raw = await fetchConversationsJson(datasets[0].path);
      const files = await listDatasetFiles(datasets[0].path, { maxDepth: 2 });
      const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
      const sorted = sortConversations(normalized);
      setConversations(sorted, stats);
      draw();
      updateControlsVisibility();
    } else {
      ensureLeftVisible(true);
      renderDatasetChoices(left, datasets, {
        activeId: getState().selectedDataset?.id,
        onChoose: async (d) => {
          setSelectedDataset(d);
          const raw = await fetchConversationsJson(d.path);
          const files = await listDatasetFiles(d.path, { maxDepth: 2 });
          const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
          const sorted = sortConversations(normalized);
          setConversations(sorted, stats);
          draw();
          updateControlsVisibility();
          ensureLeftVisible(false);
        }
      });
    }
  } catch (err) {
    errorLive.textContent = err.message || String(err);
  }
}

if (btnChangeDataset) {
  btnChangeDataset.addEventListener('click', () => { showDatasetChooser(); });
}

// dataset-control removed from UI per request

// Initialize controls visibility
updateControlsVisibility();

// Initialize UI controls (theme & pane)
initThemeToggle(btnTheme);
initPaneToggle(btnPane, { layoutEl: document.querySelector('.layout'), leftPaneEl: left });

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

// Wire conversation list refresh when activeDataSetId changes via the new event bridge (US1/T015)
onActiveDataSetChanged(async (state) => {
  try {
    const id = state?.activeDataSetId;
    const s = getState();
    if (!id) return;
    if (s.selectedDataset?.id === id && Array.isArray(s.conversations) && s.conversations.length > 0) {
      // Already loaded for this dataset; no-op
      return;
    }
    const datasets = await discoverDatasets();
    const d = datasets.find((x) => String(x.id) === String(id));
    if (!d) return;
    setSelectedDataset(d);
    const raw = await fetchConversationsJson(d.path);
    const files = await listDatasetFiles(d.path, { maxDepth: 2 });
    const { normalized, stats } = normalizeConversationsWithWarnings(raw, files);
    const sorted = sortConversations(normalized);
    setConversations(sorted, stats);
    draw();
    updateControlsVisibility();
  } catch (err) {
    errorLive.textContent = err.message || String(err);
  }
});
