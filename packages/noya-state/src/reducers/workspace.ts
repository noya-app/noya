import produce from 'immer';
import { SketchFile } from 'noya-sketch-file';
import {
  createInitialHistoryState,
  HistoryAction,
  historyReducer,
  HistoryState,
} from './history';

export type LayerHighlightPrecedence = 'aboveSelection' | 'belowSelection';

export type LayerHighlight = {
  id: string;
  precedence: LayerHighlightPrecedence;
  isMeasured: boolean;
};

export type CanvasInsets = { left: number; right: number };

/**
 * This object contains state that shouldn't be part of `history`.
 * For example, we store user `preferences` here, since we would never
 * want an "undo" action to change the user's preferences.
 */
export type WorkspaceState = {
  history: HistoryState;
  highlightedLayer?: LayerHighlight;
  canvasSize: { width: number; height: number };
  canvasInsets: CanvasInsets;
  preferences: {
    showRulers: boolean;
  };
};

export type WorkspaceAction =
  | [
      type: 'setCanvasSize',
      size: { width: number; height: number },
      insets: { left: number; right: number },
    ]
  | [type: 'setShowRulers', value: boolean]
  | [type: 'highlightLayer', highlight: LayerHighlight | undefined]
  | HistoryAction;

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action[0]) {
    case 'setCanvasSize': {
      const [, size, insets] = action;

      if (
        size.width === state.canvasSize.width &&
        size.height === state.canvasSize.height &&
        insets.left === state.canvasInsets.left &&
        insets.right === state.canvasInsets.right
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
    case 'highlightLayer': {
      const [, highlight] = action;
      
      return produce(state, (draft) => {
        draft.highlightedLayer = highlight ? { ...highlight } : undefined;
      });
    }
    default: {
      return produce(state, (draft) => {
        draft.history = historyReducer(state.history, action);
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
    canvasSize: { width: 0, height: 0 },
    canvasInsets: { left: 0, right: 0 },
    preferences: {
      showRulers: false,
    },
  };
}
