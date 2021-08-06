import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import {
  ApplicationReducerContext,
  ApplicationState,
  TextSelectionRange,
} from './applicationReducer';

export type TextEditorAction = [
  type: 'setTextSelection',
  range: TextSelectionRange,
];

export function textEditorReducer(
  state: ApplicationState,
  action: TextEditorAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'setTextSelection': {
      const [, range] = action;

      return produce(state, (draft) => {
        if (!draft.selectedText) return;

        draft.selectedText.range = range;
      });
    }
    default:
      return state;
  }
}
