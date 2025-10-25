export function renderStatusChip(host, stats) {
  if (!stats || !Number.isFinite(stats.total)) {
    host.textContent = '';
    return;
  }
  const { total, loaded, skipped } = stats;
  host.textContent = `Loaded ${loaded} of ${total}${skipped ? ` (${skipped} skipped)` : ''}`;
}
