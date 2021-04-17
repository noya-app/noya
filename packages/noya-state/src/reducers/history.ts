import produce from 'immer';
import { ApplicationState, Action, reducer } from './application';
import { createInitialInteractionState } from './interaction';

type HistoryEntry = {
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
  const currentPresent = state.present;
  const [actionType] = action;
  switch (actionType) {
    case 'undo':
      return produce(state, (state) => {
        if (state.past.length > 0) {
          const newPresent = state.past.pop() as HistoryEntry;
          if (newPresent) {
            state.future.unshift(
              createHistoryEntry(newPresent.actionType, currentPresent),
            );
            state.present = newPresent.state;
          }
        }
      });
    case 'redo':
      return produce(state, (state) => {
        if (state.future.length > 0) {
          const newPresent = state.future.shift();
          if (newPresent) {
            state.past.push(
              createHistoryEntry(newPresent.actionType, currentPresent),
            );
            state.present = newPresent.state;
          }
        }
      });
    default:
      const newPresent = reducer(currentPresent, action as Action);
      return produce(state, (state) => {
        const sketchFileChanged =
          JSON.stringify(currentPresent.sketch) !==
          JSON.stringify(newPresent.sketch);

        const historyEntry = createHistoryEntry(actionType, {
          ...currentPresent,
          interactionState: createInitialInteractionState(),
        });

        const pushHistoryEntry = () => {
          state.past.push(historyEntry);
        };

        if (sketchFileChanged) {
          if (state.past.length > 0) {
            const newTimestamp = Date.now();
            const previousEntry = state.past[state.past.length - 1];
            if (
              newTimestamp - previousEntry.timestamp < FILE_CHANGED_TIMEOUT &&
              actionType === previousEntry.actionType
            ) {
              state.past[state.past.length - 1] = {
                ...historyEntry,
                state: previousEntry.state,
              };
            } else {
              pushHistoryEntry();
            }
          } else {
            pushHistoryEntry();
          }
          state.future = [];
        }
        state.present = newPresent;
      });
  }
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
