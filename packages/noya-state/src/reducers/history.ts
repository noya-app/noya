import { SketchFile } from 'noya-sketch-file';
import produce from 'immer';
import {
  ApplicationState,
  Action,
  reducer,
  createInitialState,
} from './application';
import { createInitialInteractionState } from './interaction';

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

export type HistoryAction = [type: 'undo'] | [type: 'redo'] | Action;

const FILE_CHANGED_TIMEOUT = 300;

export function historyReducer(state: HistoryState, action: HistoryAction) {
  const currentState = state.present;
  switch (action[0]) {
    case 'undo':
      if (state.past.length === 0) {
        return state;
      } else {
        return produce(state, (draftState) => {
          const nextPresent = draftState.past.pop();
          if (nextPresent) {
            draftState.future.unshift(
              createHistoryEntry(nextPresent.actionType, currentState),
            );
            draftState.present = nextPresent.state;
          }
        });
      }
    case 'redo':
      if (state.future.length === 0) {
        return state;
      } else {
        return produce(state, (draftState) => {
          const nextPresent = draftState.future.shift();
          if (nextPresent) {
            draftState.past.push(
              createHistoryEntry(nextPresent.actionType, currentState),
            );
            draftState.present = nextPresent.state;
          }
        });
      }
    default:
      const nextState = reducer(currentState, action);
      const mergableEntry = getMergableHistoryEntry(state, action[0]);
      const sketchFileChanged = currentState.sketch !== nextState.sketch;
      return produce(state, (draftState) => {
        const historyEntry = createHistoryEntry(action[0], {
          ...currentState,
          interactionState: createInitialInteractionState(),
        });
        if (sketchFileChanged) {
          if (mergableEntry) {
            draftState.past[draftState.past.length - 1] = {
              ...historyEntry,
              state: mergableEntry.state,
            };
          } else {
            draftState.past.push(historyEntry);
          }
          draftState.future = [];
        }
        draftState.present = nextState;
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
