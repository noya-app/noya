import produce from 'immer';

import Sketch from 'noya-file-format';
import { clamp } from 'noya-utils';
import { SetNumberMode } from './applicationReducer';

import Sketch from 'noya-file-format';
import { clamp } from 'noya-utils';
import { SetNumberMode } from './applicationReducer';

export type ColorControlsAction =
  | [type: 'setColorControlsEnabled', isEnabled: boolean]
  | [type: 'setHue', amount: number, mode?: SetNumberMode]
  | [type: 'setSaturation', amount: number, mode?: SetNumberMode]
  | [type: 'setBrightness', amount: number, mode?: SetNumberMode]
  | [type: 'setContrast', amount: number, mode?: SetNumberMode];

export function colorControlsReducer(
  state: Sketch.ColorControls,
  action: ColorControlsAction,
): Sketch.ColorControls {
  switch (action[0]) {
    case 'setColorControlsEnabled': {
      const [, isEnabled] = action;

      return produce(state, (draft) => {
        draft.isEnabled = isEnabled;
      });
    }
    case 'setHue': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        const newValue = mode === 'replace' ? amount : draft.hue + amount;

        draft.hue = clamp(newValue, -Math.PI, Math.PI);
      });
    }
    case 'setSaturation': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        const newValue =
          mode === 'replace' ? amount : draft.saturation + amount;

        draft.saturation = clamp(newValue, 0, 2);
      });
    }
    case 'setBrightness': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        const newValue =
          mode === 'replace' ? amount : draft.brightness + amount;

        draft.brightness = clamp(newValue, -1, 1);
      });
    }
    case 'setContrast': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        const newValue = mode === 'replace' ? amount : draft.contrast + amount;

        draft.contrast = clamp(newValue, 0, 4);
      });
    }
    default:
      return state;
  }
}
