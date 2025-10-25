export function effectiveModel({ modelDefault = 'Claude Sonnet 4.5', modelSession = null } = {}) {
  return modelSession || modelDefault || 'Claude Sonnet 4.5';
}

export function channelsFor(modelName) {
  // For now, Sonnet 4.5 supports text + images; others default to text only
  const lower = String(modelName).toLowerCase();
  if (lower.includes('sonnet')) return { text: true, images: true };
  return { text: true, images: false };
}
