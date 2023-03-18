import type { FileSystemHandle } from 'browser-fs-access';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { Insets, Size } from 'noya-geometry';
import { IFontManager } from 'noya-renderer';
import { SketchFile } from 'noya-sketch-file';
import { SketchModel } from 'noya-sketch-model';
import { createSketchFile } from '../sketchFile';
import {
  createInitialHistoryState,
  HistoryAction,
  historyReducer,
  HistoryState,
} from './historyReducer';

export type LayerHighlightPrecedence = 'aboveSelection' | 'belowSelection';

export type LayerHighlight = {
  id: string;
  precedence: LayerHighlightPrecedence;
  isMeasured: boolean;
};

export type CanvasInsets = { left: number; right: number };

export type NextFocusAction =
  | { type: 'renamePage'; id: string }
  | { type: 'renameLayer'; id: string };

/**
 * This object contains state that shouldn't be part of `history`.
 * For example, we store user `preferences` here, since we would never
 * want an "undo" action to change the user's preferences.
 */
export type WorkspaceState = {
  fileHandle?: FileSystemHandle;
  history: HistoryState;
  highlightedLayer?: LayerHighlight;
  isContextMenuOpen: boolean;
  canvasSize: { width: number; height: number };
  canvasInsets: Insets;
  nextFocusAction?: NextFocusAction;
  preferences: {
    showLeftSidebar: boolean;
    showRightSidebar: boolean;
    showInterface: boolean;
    showRulers: boolean;
    showPixelGrid: boolean;
    showPageListThumbnails: boolean;
    showDotGrid: boolean;
    wireframeMode: boolean;
  };
};

export type WorkspaceAction =
  | [type: 'newFile']
  | [type: 'setFile', value: SketchFile, fileHandle?: FileSystemHandle]
  | [type: 'setFileHandle', value?: FileSystemHandle]
  | [type: 'setCanvasSize', size: Size, insets: Insets]
  | [type: 'setShowRulers', value: boolean]
  | [type: 'setShowPageListThumbnails', value: boolean]
  | [type: 'setShowLeftSidebar', value: boolean]
  | [type: 'setShowRightSidebar', value: boolean]
  | [type: 'setShowInterface', value: boolean]
  | [type: 'setNextFocusAction', value?: NextFocusAction]
  | [type: 'highlightLayer', highlight: LayerHighlight | undefined]
  | [type: 'setIsContextMenuOpen', value: boolean]
  | [type: 'setDesignSystemId', value: string]
  | HistoryAction;

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
): WorkspaceState {
  switch (action[0]) {
    case 'setDesignSystemId': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.history.present.sketch.document.designSystem = {
          id: value,
        };
      });
    }
    case 'newFile': {
      return produce(state, (draft) => {
        draft.fileHandle = undefined;
        draft.history = createInitialHistoryState(
          createSketchFile(
            SketchModel.page({
              name: 'Page 1',
            }),
          ),
        );
      });
    }
    case 'setFile': {
      const [, sketchFile, fileHandle] = action;
      return produce(state, (draft) => {
        draft.fileHandle = fileHandle;
        draft.history = createInitialHistoryState(sketchFile);
      });
    }
    case 'setFileHandle': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.fileHandle = value;
      });
    }
    case 'setCanvasSize': {
      const [, size, insets] = action;

      if (
        size.width === state.canvasSize.width &&
        size.height === state.canvasSize.height &&
        insets.left === state.canvasInsets.left &&
        insets.right === state.canvasInsets.right &&
        insets.top === state.canvasInsets.top &&
        insets.bottom === state.canvasInsets.bottom
      ) {
        return state;
      }

      return produce(state, (draft) => {
        draft.canvasSize = size;
        draft.canvasInsets = insets;
      });
    }
    case 'setShowRulers': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.preferences.showRulers = value;
      });
    }
    case 'setShowPageListThumbnails': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.preferences.showPageListThumbnails = value;
      });
    }
    case 'setShowLeftSidebar': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.preferences.showLeftSidebar = value;

        if (value && !draft.preferences.showInterface) {
          draft.preferences.showInterface = true;

          if (draft.preferences.showRightSidebar) {
            draft.preferences.showRightSidebar = false;
          }
        }
      });
    }
    case 'setShowRightSidebar': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.preferences.showRightSidebar = value;

        if (value && !draft.preferences.showInterface) {
          draft.preferences.showInterface = true;

          if (draft.preferences.showLeftSidebar) {
            draft.preferences.showLeftSidebar = false;
          }
        }
      });
    }
    case 'setShowInterface': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.preferences.showInterface = value;

        // If the sidebars are both set to hidden, showing the interface
        // won't do anything unless we also show the sidebars.
        if (
          value &&
          !draft.preferences.showLeftSidebar &&
          !draft.preferences.showRightSidebar
        ) {
          draft.preferences.showLeftSidebar = true;
          draft.preferences.showRightSidebar = true;
        }
      });
    }
    case 'highlightLayer': {
      const [, highlight] = action;

      return produce(state, (draft) => {
        draft.highlightedLayer = highlight ? { ...highlight } : undefined;
      });
    }
    case 'setNextFocusAction': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.nextFocusAction = value;
      });
    }
    case 'setIsContextMenuOpen': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.isContextMenuOpen = value;
      });
    }
    default: {
      return produce(state, (draft) => {
        draft.history = historyReducer(state.history, action, CanvasKit, {
          canvasInsets: state.canvasInsets,
          canvasSize: state.canvasSize,
          fontManager,
        });
      });
    }
  }
}

export function createInitialWorkspaceState(
  sketch: SketchFile,
): WorkspaceState {
  return {
    history: createInitialHistoryState(sketch),
    highlightedLayer: undefined,
    isContextMenuOpen: false,
    canvasSize: { width: 0, height: 0 },
    canvasInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    preferences: {
      showLeftSidebar: true,
      showRightSidebar: true,
      showInterface: true,
      showRulers: false,
      showPixelGrid: true,
      showPageListThumbnails: false,
      showDotGrid: false,
      wireframeMode: false,
    },
  };
}
