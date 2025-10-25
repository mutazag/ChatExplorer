import { effectiveModel } from '../../policy/modelPolicy.js';

export function renderModelBadge(host, state) {
  const name = effectiveModel(state);
  host.textContent = `Model: ${name}`;
}
