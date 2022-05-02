import { useDesignSystemConfiguration } from 'noya-ui';

/**
 * Either ctrl or meta, depending on the platform
 */
export function useModKey(): 'ctrlKey' | 'metaKey' {
  const platform = useDesignSystemConfiguration().platform;
  return platform === 'macos' ? 'metaKey' : 'ctrlKey';
}
