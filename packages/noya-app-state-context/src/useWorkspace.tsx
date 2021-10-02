import { LayerHighlight } from 'noya-state';
import { useCallback, useMemo } from 'react';
import { useWorkspaceState, useDispatch } from 'noya-app-state-context';
import { Insets, Size } from 'noya-geometry';

export function useWorkspace() {
  const state = useWorkspaceState();
  const dispatch = useDispatch();

  const {
    fileHandle,
    highlightedLayer,
    canvasSize,
    canvasInsets,
    preferences,
    nextFocusAction,
    isolatedLayer,
    draggedBitmapTemplate,
  } = state;

  const setCanvasSize = useCallback(
    (size: Size, insets: Insets) => {
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

  const startRenamingPage = useCallback(
    (id: string) =>
      dispatch('setNextFocusAction', {
        type: 'renamePage',
        id,
      }),
    [dispatch],
  );

  const startRenamingLayer = useCallback(
    (id: string) =>
      dispatch('setNextFocusAction', {
        type: 'renameLayer',
        id,
      }),
    [dispatch],
  );

  const didHandleFocus = useCallback(
    () => dispatch('setNextFocusAction', undefined),
    [dispatch],
  );

  const renamingPage =
    nextFocusAction?.type === 'renamePage' ? nextFocusAction.id : undefined;

  const renamingLayer =
    nextFocusAction?.type === 'renameLayer' ? nextFocusAction.id : undefined;

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
      didHandleFocus,
      renamingPage,
      startRenamingPage,
      renamingLayer,
      startRenamingLayer,
      isolatedLayer,
      draggedBitmapTemplate,
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
      didHandleFocus,
      renamingPage,
      startRenamingPage,
      renamingLayer,
      startRenamingLayer,
      isolatedLayer,
      draggedBitmapTemplate,
    ],
  );
}
