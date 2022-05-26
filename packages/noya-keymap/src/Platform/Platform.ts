import type { PlatformName } from '../types';

export const getCurrentPlatform = (navigator?: {
  platform: string;
}): PlatformName => {
  if (typeof navigator === 'undefined') {
    return 'key';
  }

  return /Mac/.test(navigator.platform)
    ? 'macos'
    : /Win/.test(navigator.platform)
    ? 'windows'
    : /Linux|X11/.test(navigator.platform)
    ? 'linux'
    : 'key';
};
