import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { clamp } from 'noya-utils';
import { SetNumberMode } from '..';

export type ColorControlsAction = [
  type: 'setHue',
  amount: number,
  mode?: SetNumberMode,
];

export function colorControlsReducer(
  state: Sketch.ColorControls,
  action: ColorControlsAction,
): Sketch.ColorControls {
  switch (action[0]) {
    case 'setHue': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        const newValue = mode === 'replace' ? amount : draft.hue + amount;

        draft.hue = clamp(newValue, -Math.PI, Math.PI);
      });
    }
    default:
      return state;
  }
}
