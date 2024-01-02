import { Sketch } from '@noya-app/noya-file-format';
import { clamp } from '@noya-app/noya-utils';
import produce from 'immer';
import { SketchModel } from 'noya-sketch-model';
import { SetNumberMode } from '../types';

export type BlurAction =
  | [type: 'setBlurEnabled', isEnabled: boolean]
  | [type: 'setBlurType', value: Sketch.BlurType]
  | [type: 'setBlurRadius', value: number, mode: SetNumberMode]
  | [type: 'setBlurSaturation', value: number, mode: SetNumberMode];

export function blurReducer(
  state: Sketch.Blur | undefined,
  action: BlurAction,
): Sketch.Blur {
  state = state ?? SketchModel.blur();

  switch (action[0]) {
    case 'setBlurEnabled': {
      const [, isEnabled] = action;

      return produce(state, (draft) => {
        draft.isEnabled = isEnabled;
      });
    }
    case 'setBlurType': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.type = value;
      });
    }
    case 'setBlurRadius': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        const newValue =
          mode === 'replace' ? amount : (draft.radius ?? 0) + amount;

        draft.radius = clamp(newValue, 0, 50);
      });
    }
    case 'setBlurSaturation': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        const newValue =
          mode === 'replace' ? amount : draft.saturation + amount;

        draft.saturation = clamp(newValue, 0, 2);
      });
    }
    default:
      return state;
  }
}
