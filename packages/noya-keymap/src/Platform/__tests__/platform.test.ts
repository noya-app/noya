import { getCurrentPlatform } from '../Platform';

test('determines the platform name', () => {
  expect(getCurrentPlatform()).toEqual('key');
  expect(getCurrentPlatform({ platform: 'MacIntel' })).toEqual('macos');
});
