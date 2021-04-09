import produce from 'immer';
import { ApplicationState, Action, reducer } from './application';

export type HistoryState = {
  past: Array<ApplicationState>;
  present: ApplicationState;
  future: Array<ApplicationState>;
};

export type HistoryAction = [type: 'undo'] | [type: 'redo'] | Action;

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
      const newPresent = state.present;
      return produce(state, (state) => {
        state.past.push(newPresent);
        state.present = reducer(newPresent, action);
        state.future = [];
      });
  }
}
