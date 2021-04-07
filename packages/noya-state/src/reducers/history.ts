import produce from 'immer';
import { ApplicationState, Action, reducer } from './application';

export type History = {
  past: Array<ApplicationState>;
  present: ApplicationState;
  future: Array<ApplicationState>;
};

export type HistoryAction =
  | [type: 'undo', value: null]
  | [type: 'redo', value: null];

export function historyReducer(state: History, action: HistoryAction) {
  switch (action[0]) {
    case 'undo':
      return produce(state, (state) => {
        if (state.past.length > 0) {
          const newPresent = state.past.pop();
          state.future.unshift(state.present);
          state.present = newPresent;
        }
      });
    case 'redo':
      return produce(state, (state) => {
        if (state.future.length > 0) {
          const newPresent = state.future.shift();
          state.past.push(state.present);
          state.present = newPresent;
        }
      });
    default:
      return produce(state, (state) => {
        state.past.push(state.present);
        state.present = reducer(state.present, action as Action);
        state.future = [];
      });
  }
}
