import { Insets, Size } from '@noya-app/noya-geometry';
import { useDispatch, useWorkspaceState } from 'noya-app-state-context';
import { LayerHighlight } from 'noya-state';
import { useCallback, useMemo } from 'react';

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
    isContextMenuOpen,
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

  const setShowPageListThumbnails = useCallback(
    (value: boolean) => dispatch('setShowPageListThumbnails', value),
    [dispatch],
  );

  const setShowInterface = useCallback(
    (value: boolean) => dispatch('setShowInterface', value),
    [dispatch],
  );

  const setShowLeftSidebar = useCallback(
    (value: boolean) => dispatch('setShowLeftSidebar', value),
    [dispatch],
  );

  const setShowRightSidebar = useCallback(
    (value: boolean) => dispatch('setShowRightSidebar', value),
    [dispatch],
  );

  const highlightLayer = useCallback(
    (highlight?: LayerHighlight) => dispatch('highlightLayer', highlight),
    [dispatch],
  );

  const setIsContextMenuOpen = useCallback(
    (value: boolean) => dispatch('setIsContextMenuOpen', value),
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

  const focusingFirstArtboard = nextFocusAction?.type === 'focusFirstArtboard';

  // The preferences for showing the various interface elements combine to feel natural
  // for the user, but can look misleading in code. E.g. if `showInterface`
  // is false, then we don't show the left sidebar even if `showLeftSidebar` is true.
  // These `actually` variables more accurately represent the state of the UI in code.
  const actuallyShowLeftSidebar =
    preferences.showInterface && preferences.showLeftSidebar;
  const actuallyShowRightSidebar =
    preferences.showInterface && preferences.showRightSidebar;
  const actuallyShowInterface =
    preferences.showInterface &&
    (preferences.showLeftSidebar || preferences.showRightSidebar);

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
      setShowPageListThumbnails,
      setShowInterface,
      setShowLeftSidebar,
      setShowRightSidebar,
      didHandleFocus,
      renamingPage,
      startRenamingPage,
      renamingLayer,
      startRenamingLayer,
      actuallyShowLeftSidebar,
      actuallyShowRightSidebar,
      actuallyShowInterface,
      isContextMenuOpen,
      setIsContextMenuOpen,
      focusingFirstArtboard,
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
      setShowPageListThumbnails,
      setShowInterface,
      setShowLeftSidebar,
      setShowRightSidebar,
      didHandleFocus,
      renamingPage,
      startRenamingPage,
      renamingLayer,
      startRenamingLayer,
      actuallyShowLeftSidebar,
      actuallyShowRightSidebar,
      actuallyShowInterface,
      isContextMenuOpen,
      setIsContextMenuOpen,
      focusingFirstArtboard,
    ],
  );
}
