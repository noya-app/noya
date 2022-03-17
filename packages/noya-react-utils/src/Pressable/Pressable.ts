import { DependencyList, useCallback } from 'react';
import { PressableHandler } from './types';

export function usePressableHandler(
  handler: PressableHandler,
  deps: DependencyList,
) {
  return useCallback(handler, [...deps, handler]);
}
