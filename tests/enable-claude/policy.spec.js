import { test, assert } from '../lib/harness.js';
import { effectiveModel, channelsFor } from '../../src/policy/modelPolicy.js';

test('effectiveModel: session override takes precedence', () => {
  const name = effectiveModel({ modelDefault: 'Claude Sonnet 4.5', modelSession: 'OtherModel' });
  assert(name === 'OtherModel', 'session override wins');
});

test('channelsFor: sonnet supports images', () => {
  const ch = channelsFor('Claude Sonnet 4.5');
  assert(ch.text && ch.images, 'text+images enabled');
});
