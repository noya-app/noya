export type PlatformName = 'mac' | 'win' | 'linux' | 'key';

export const getCurrentPlatform = (navigator?: {
  platform: string;
}): PlatformName =>
  typeof navigator === 'undefined'
    ? 'key'
    : /Mac/.test(navigator.platform)
    ? 'mac'
    : /Win/.test(navigator.platform)
    ? 'win'
    : /Linux|X11/.test(navigator.platform)
    ? 'linux'
    : 'key';
