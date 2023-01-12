import { useDesignSystemConfiguration } from '../contexts/DesignSystemConfiguration';

export function usePlatform() {
  return useDesignSystemConfiguration().platform;
}

/**
 * Either ctrl or meta, depending on the platform
 */
export function usePlatformModKey(): 'ctrlKey' | 'metaKey' {
  const platform = useDesignSystemConfiguration().platform;
  return platform === 'mac' ? 'metaKey' : 'ctrlKey';
}
