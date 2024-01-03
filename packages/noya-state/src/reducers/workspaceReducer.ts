import { Insets, Size } from '@noya-app/noya-geometry';
import { SketchFile } from '@noya-app/noya-sketch-file';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { DSConfig } from 'noya-api';
import { IFontManager } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { createSketchFile } from '../sketchFile';
import { CustomReducer } from './applicationReducer';
import {
  HistoryAction,
  HistoryState,
  createInitialHistoryState,
  historyReducer,
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
  | { type: 'renameLayer'; id: string }
  | { type: 'focusFirstArtboard' };

/**
 * This object contains state that shouldn't be part of `history`.
 * For example, we store user `preferences` here, since we would never
 * want an "undo" action to change the user's preferences.
 */
export type WorkspaceState = {
  fileHandle?: FileSystemFileHandle;
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

export type WorkspaceAction<T = never> =
  | [type: 'newFile']
  | [type: 'setFile', value: SketchFile, fileHandle?: FileSystemFileHandle]
  | [type: 'setFileHandle', value?: FileSystemFileHandle]
  | [type: 'setCanvasSize', size: Size, insets: Insets]
  | [type: 'setShowRulers', value: boolean]
  | [type: 'setShowPageListThumbnails', value: boolean]
  | [type: 'setShowLeftSidebar', value: boolean]
  | [type: 'setShowRightSidebar', value: boolean]
  | [type: 'setShowInterface', value: boolean]
  | [type: 'setNextFocusAction', value?: NextFocusAction]
  | [type: 'highlightLayer', highlight: LayerHighlight | undefined]
  | [type: 'setIsContextMenuOpen', value: boolean]
  | [type: 'setDesignSystem', type: 'standard' | 'custom', id: string]
  | [type: 'setDesignSystemConfig', dsConfig: DSConfig]
  | HistoryAction<T>;

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  customReducer?: CustomReducer,
): WorkspaceState {
  switch (action[0]) {
    case 'setDesignSystem': {
      const [, type, id] = action;

      return produce(state, (draft) => {
        const existingConfig =
          draft.history.present.sketch.document.designSystem?.config;

        draft.history.present.sketch.document.designSystem = {
          type,
          id,
          config: existingConfig,
        };
      });
    }
    case 'setDesignSystemConfig': {
      const [, dsConfig] = action;

      return produce(state, (draft) => {
        if (!draft.history.present.sketch.document.designSystem) {
          draft.history.present.sketch.document.designSystem = {
            id: '@noya-design-system/chakra',
            type: 'standard',
          };
        }

        draft.history.present.sketch.document.designSystem.config = dsConfig;
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
        draft.history = historyReducer(
          state.history,
          action,
          CanvasKit,
          {
            canvasInsets: state.canvasInsets,
            canvasSize: state.canvasSize,
            fontManager,
          },
          customReducer,
        );
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
