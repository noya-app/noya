import { LayerHighlight } from 'noya-state';
import { useCallback, useMemo } from 'react';
import { useWorkspaceState, useDispatch } from 'noya-app-state-context';

export function useWorkspace() {
  const state = useWorkspaceState();
  const dispatch = useDispatch();

  const {
    fileHandle,
    highlightedLayer,
    canvasSize,
    canvasInsets,
    preferences,
  } = state;

  const setCanvasSize = useCallback(
    (
      size: { width: number; height: number },
      insets: { left: number; right: number },
    ) => {
      dispatch('setCanvasSize', size, insets);
    },
    [dispatch],
  );

  const setShowRulers = useCallback(
    (value: boolean) => dispatch('setShowRulers', value),
    [dispatch],
  );

  const highlightLayer = useCallback(
    (highlight?: LayerHighlight) => dispatch('highlightLayer', highlight),
    [dispatch],
  );

  return useMemo(
    () => ({
      canvasInsets,
      canvasSize,
      fileHandle,
      highlightedLayer,
      highlightLayer,
      preferences,
      setCanvasSize,
      setShowRulers,
    }),
    [
      canvasInsets,
      canvasSize,
      fileHandle,
      highlightedLayer,
      highlightLayer,
      preferences,
      setCanvasSize,
      setShowRulers,
    ],
  );
}
