import { useMemo } from 'react';
import {
  useWorkspaceState,
  useDispatch,
} from '../contexts/ApplicationStateContext';

export function useHistory() {
  const state = useWorkspaceState();
  const dispatch = useDispatch();
  const redoDisabled = state.history.future.length === 0;
  const undoDisabled = state.history.past.length === 0;

  return useMemo(
    () => ({
      redo: () => dispatch('redo'),
      undo: () => dispatch('undo'),
      redoDisabled,
      undoDisabled,
    }),
    [dispatch, redoDisabled, undoDisabled],
  );
}
