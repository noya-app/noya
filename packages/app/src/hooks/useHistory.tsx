import { useWorkspaceState } from 'noya-app-state-context';
import { useMemo } from 'react';

export function useHistory() {
  const state = useWorkspaceState();
  const redoDisabled = state.history.future.length === 0;
  const undoDisabled = state.history.past.length === 0;

  return useMemo(
    () => ({
      redoDisabled,
      undoDisabled,
    }),
    [redoDisabled, undoDisabled],
  );
}
