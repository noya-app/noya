import type { PlatformName } from '../types';
import { Platform } from 'react-native';

export const getCurrentPlatform = (): PlatformName => {
  // Platform.OS will never return 'web' in native file
  return Platform.OS as PlatformName;
};
