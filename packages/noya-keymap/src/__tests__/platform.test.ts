import { getCurrentPlatform } from '../platform';

test('determines the platform name', () => {
  expect(getCurrentPlatform()).toEqual('key');
  expect(getCurrentPlatform({ platform: 'MacIntel' })).toEqual('mac');
});
