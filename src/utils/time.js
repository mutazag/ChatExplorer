export function toHuman(epochSeconds) {
  if (!epochSeconds && epochSeconds !== 0) return '';
  const d = new Date(epochSeconds * 1000);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}
