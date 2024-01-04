import { SketchFile } from '@noya-app/noya-sketch-file';
import { CanvasKit } from '@noya-app/noya-canvaskit';
import produce from 'immer';
import {
  Action,
  ApplicationReducerContext,
  ApplicationState,
  CustomReducer,
  applicationReducer,
  createInitialState,
} from './applicationReducer';
import { createInitialInteractionState } from './interactionReducer';

export type HistoryEntry = {
  actionType: Action[0];
  timestamp: number;
  state: ApplicationState;
};

export type HistoryState = {
  past: HistoryEntry[];
  present: ApplicationState;
  future: HistoryEntry[];
};

export type HistoryAction<T = never> =
  | [type: 'undo']
  | [type: 'redo']
  | Action<T>;

const FILE_CHANGED_TIMEOUT = 300;

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
  customReducer?: CustomReducer,
) {
  const currentState = state.present;
  switch (action[0]) {
    case 'undo':
      if (state.past.length === 0) {
        return state;
      } else {
        return produce(state, (draft) => {
          const user = draft.present.sketch.user;
          const interactionState = draft.present.interactionState;
          const nextPresent = draft.past.pop();
          if (nextPresent) {
            draft.future.unshift(
              createHistoryEntry(nextPresent.actionType, currentState),
            );
            draft.present = nextPresent.state;
            draft.present.sketch.user = user;
            draft.present.interactionState = interactionState;
          }
        });
      }
    case 'redo':
      if (state.future.length === 0) {
        return state;
      } else {
        return produce(state, (draft) => {
          const user = draft.present.sketch.user;
          const interactionState = draft.present.interactionState;
          const nextPresent = draft.future.shift();
          if (nextPresent) {
            draft.past.push(
              createHistoryEntry(nextPresent.actionType, currentState),
            );
            draft.present = nextPresent.state;
            draft.present.sketch.user = user;
            draft.present.interactionState = interactionState;
          }
        });
      }
    default:
      const nextState = applicationReducer(
        currentState,
        action,
        CanvasKit,
        context,
        customReducer,
      );
      const mergableEntry = getMergableHistoryEntry(state, action[0]);
      const sketchFileChanged = currentState.sketch !== nextState.sketch;
      return produce(state, (draft) => {
        const historyEntry = createHistoryEntry(action[0], {
          ...currentState,
          interactionState: createInitialInteractionState(),
        });
        if (
          sketchFileChanged &&
          !action[0].includes('*') &&
          action[0] !== 'interaction'
        ) {
          if (mergableEntry) {
            draft.past[draft.past.length - 1] = {
              ...historyEntry,
              state: mergableEntry.state,
            };
          } else {
            draft.past.push(historyEntry);
          }
          draft.future = [];
        }
        draft.present = nextState;
      });
  }
}

export function createInitialHistoryState(sketch: SketchFile): HistoryState {
  const applicationState = createInitialState(sketch);
  return {
    past: [],
    present: applicationState,
    future: [],
  };
}

function createHistoryEntry(
  actionType: Action[0],
  state: ApplicationState,
): HistoryEntry {
  return {
    actionType,
    state,
    timestamp: Date.now(),
  };
}

function getMergableHistoryEntry(
  state: HistoryState,
  actionType: Action[0],
): HistoryEntry | undefined {
  if (state.past.length === 0) {
    return;
  }

  const newTimestamp = Date.now();
  const previousEntry = state.past[state.past.length - 1];

  if (
    actionType !== previousEntry.actionType ||
    newTimestamp - previousEntry.timestamp > FILE_CHANGED_TIMEOUT
  ) {
    return;
  }

  return previousEntry;
}
