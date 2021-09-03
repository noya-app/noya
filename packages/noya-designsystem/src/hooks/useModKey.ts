import { useDesignSystemConfiguration } from '../contexts/DesignSystemConfiguration';

/**
 * Either ctrl or meta, depending on the platform
 */
export function useModKey(): 'ctrlKey' | 'metaKey' {
  const platform = useDesignSystemConfiguration().platform;
  return platform === 'mac' ? 'metaKey' : 'ctrlKey';
}
