import produce from 'immer';
import { ApplicationState, Action, reducer } from './application';
import { createInitialInteractionState } from './interaction';

export type HistoryState = {
  past: Array<ApplicationState>;
  present: ApplicationState;
  future: Array<ApplicationState>;
  timestamp?: number;
};

export type HistoryAction = [type: 'undo'] | [type: 'redo'] | Action;

const FILE_CHANGED_TIMEOUT = 300;

export function historyReducer(state: HistoryState, action: HistoryAction) {
  switch (action[0]) {
    case 'undo':
      return produce(state, (state) => {
        if (state.past.length > 0) {
          const newPresent = state.past.pop();
          if (newPresent) {
            state.future.unshift(state.present);
            state.present = newPresent;
          }
        }
      });
    case 'redo':
      return produce(state, (state) => {
        if (state.future.length > 0) {
          const newPresent = state.future.shift();
          if (newPresent) {
            state.past.push(state.present);
            state.present = newPresent;
          }
        }
      });
    default:
      const currentPresent = state.present;
      return produce(state, (state) => {
        const newPresent = reducer(currentPresent, action);
        const newTimestamp = Date.now();
        const sketchFileChanged =
          JSON.stringify(currentPresent.sketch) !==
          JSON.stringify(newPresent.sketch);
        if (
          sketchFileChanged &&
          state.timestamp &&
          newTimestamp - state.timestamp > FILE_CHANGED_TIMEOUT
        ) {
          state.past.push({
            ...currentPresent,
            interactionState: createInitialInteractionState(),
          });
          state.future = [];
        }
        state.timestamp = newTimestamp;
        state.present = newPresent;
      });
  }
}
