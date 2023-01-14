import { useWorkspaceState } from 'noya-app-state-context';
import { useMemo } from 'react';

export function useHistory() {
  const state = useWorkspaceState();
  const canRedo = state.history.future.length > 0;
  const canUndo = state.history.past.length > 0;

  return useMemo(
    () => ({
      canRedo,
      canUndo,
    }),
    [canRedo, canUndo],
  );
}
