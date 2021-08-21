import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { GradientAction, gradientReducer } from './gradientReducer';
import {
  ColorControlsAction,
  colorControlsReducer,
} from './colorControlsReducer';
import { clamp } from 'noya-utils';
import { SketchModel } from 'noya-sketch-model';
import { moveArrayItem } from '../utils/moveArrayItem';
import { BlurAction, blurReducer } from './blurReducer';

export const defaultBorderColor = SketchModel.color({
  red: 0.6,
  green: 0.6,
  blue: 0.6,
});

export const defaultFillColor = SketchModel.color({
  red: 0.85,
  green: 0.85,
  blue: 0.85,
});

export type SetNumberMode = 'replace' | 'adjust';

export type StyleElementType = 'Fill' | 'Border' | 'Shadow';

export type StyleShadowProperty = 'X' | 'Y' | 'Blur' | 'Spread';

export type StyleAction =
  | [type: `addNew${StyleElementType}`]
  | [type: `delete${StyleElementType}`, index: number]
  | [
      type: `move${StyleElementType}`,
      sourceIndex: number,
      destinationIndex: number,
    ]
  | [type: `deleteDisabled${StyleElementType}s`]
  | [type: `set${StyleElementType}Enabled`, index: number, isEnabled: boolean]
  | [
      type: 'setBorderWidth',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [type: 'setBorderPosition', index: number, position: Sketch.BorderPosition]
  | [
      type: 'setFillOpacity',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [
      type: `setShadow${StyleShadowProperty}`,
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [type: 'setOpacity', amount: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode]
  | [type: `set${StyleElementType}Color`, index: number, value: Sketch.Color]
  | [
      type: `set${Exclude<StyleElementType, 'Shadow'>}FillType`,
      index: number,
      value: Sketch.FillType,
    ]
  | [type: 'setPatternFillType', index: number, value: Sketch.PatternFillType]
  | [
      type: 'setPatternTileScale',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [
      type: 'setFillImage',
      index: number,
      value: Sketch.FileRef | Sketch.DataRef,
    ]
  | [
      type: 'setFillContextSettingsOpacity',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | GradientAction
  | ColorControlsAction
  | BlurAction;

export function styleReducer(
  state: Sketch.Style,
  action: StyleAction,
): Sketch.Style {
  switch (action[0]) {
    case 'addNewBorder':
      return produce(state, (draft) => {
        const border = SketchModel.border({
          color: defaultBorderColor,
        });

        if (draft.borders) {
          draft.borders.push(border);
        } else {
          draft.borders = [border];
        }
      });
    case 'addNewFill':
      return produce(state, (draft) => {
        const fill = SketchModel.fill({
          color: defaultFillColor,
        });

        if (draft.fills) {
          draft.fills.push(fill);
        } else {
          draft.fills = [fill];
        }
      });
    case 'addNewShadow':
      const shadow = SketchModel.shadow({
        color: SketchModel.color({ alpha: 0.5 }),
        offsetY: 2,
        blurRadius: 4,
      });

      return produce(state, (draft) => {
        if (draft.shadows) {
          draft.shadows.push(shadow);
        } else {
          draft.shadows = [shadow];
        }
      });
    case 'setBorderEnabled': {
      const [, index, isEnabled] = action;
      return produce(state, (draft) => {
        if (draft.borders && draft.borders[index]) {
          draft.borders[index].isEnabled = isEnabled;
        }
      });
    }
    case 'setFillEnabled': {
      const [, index, isEnabled] = action;
      return produce(state, (draft) => {
        if (draft.fills && draft.fills[index]) {
          draft.fills[index].isEnabled = isEnabled;
        }
      });
    }
    case 'setShadowEnabled': {
      const [, index, isEnabled] = action;
      return produce(state, (draft) => {
        if (draft.shadows && draft.shadows[index]) {
          draft.shadows[index].isEnabled = isEnabled;
        }
      });
    }
    case 'deleteBorder':
      return produce(state, (draft) => {
        if (draft.borders) {
          draft.borders.splice(action[1], 1);
        }
      });
    case 'deleteFill':
      return produce(state, (draft) => {
        if (draft.fills) {
          draft.fills.splice(action[1], 1);
        }
      });
    case 'deleteShadow':
      return produce(state, (draft) => {
        if (draft.shadows) {
          draft.shadows.splice(action[1], 1);
        }
      });
    case 'moveBorder': {
      const [, sourceIndex, destinationIndex] = action;
      return produce(state, (draft) => {
        if (!draft.borders) return;

        moveArrayItem(draft.borders, sourceIndex, destinationIndex);
      });
    }
    case 'moveFill': {
      const [, sourceIndex, destinationIndex] = action;
      return produce(state, (draft) => {
        if (!draft.fills) return;

        moveArrayItem(draft.fills, sourceIndex, destinationIndex);
      });
    }
    case 'moveShadow': {
      const [, sourceIndex, destinationIndex] = action;
      return produce(state, (draft) => {
        if (!draft.shadows) return;

        moveArrayItem(draft.shadows, sourceIndex, destinationIndex);
      });
    }
    case 'deleteDisabledBorders':
      return produce(state, (draft) => {
        if (draft.borders) {
          draft.borders = draft.borders.filter((border) => border.isEnabled);
        }
      });
    case 'deleteDisabledFills':
      return produce(state, (draft) => {
        if (draft.fills) {
          draft.fills = draft.fills.filter((fill) => fill.isEnabled);
        }
      });
    case 'deleteDisabledShadows':
      return produce(state, (draft) => {
        if (draft.shadows) {
          draft.shadows = draft.shadows.filter((fill) => fill.isEnabled);
        }
      });
    case 'setBorderColor': {
      const [, index, color] = action;
      return produce(state, (draft) => {
        if (draft.borders && draft.borders[index]) {
          draft.borders[index].color = color;
        }
      });
    }
    case 'setFillColor': {
      const [, index, color] = action;
      return produce(state, (draft) => {
        if (draft.fills && draft.fills[index]) {
          draft.fills[index].color = color;
        }
      });
    }
    case 'setShadowColor': {
      const [, index, color] = action;
      return produce(state, (draft) => {
        if (draft.shadows && draft.shadows[index]) {
          draft.shadows[index].color = color;
        }
      });
    }
    case 'setBorderWidth': {
      const [, index, amount, mode = 'replace'] = action;
      return produce(state, (draft) => {
        if (!draft.borders || !draft.borders[index]) return;

        const newValue =
          mode === 'replace' ? amount : draft.borders[index].thickness + amount;

        draft.borders[index].thickness = Math.max(0, newValue);
      });
    }
    case 'setFillOpacity': {
      const [, index, amount, mode = 'replace'] = action;
      return produce(state, (draft) => {
        if (!draft.fills || !draft.fills[index]) return;

        const newValue =
          mode === 'replace' ? amount : draft.fills[index].color.alpha + amount;

        draft.fills[index].color.alpha = clamp(newValue, 0, 1);
      });
    }
    case 'setOpacity': {
      const [, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        if (!draft.contextSettings) return;

        const newValue =
          mode === 'replace' ? amount : draft.contextSettings.opacity + amount;

        draft.contextSettings.opacity = clamp(newValue, 0, 1);
      });
    }
    case 'setShadowX': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        if (!draft.shadows || !draft.shadows[index]) return;

        const newValue =
          mode === 'replace' ? amount : draft.shadows[index].offsetX + amount;

        draft.shadows[index].offsetX = newValue;
      });
    }
    case 'setShadowY': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        if (!draft.shadows || !draft.shadows[index]) return;

        const newValue =
          mode === 'replace' ? amount : draft.shadows[index].offsetY + amount;

        draft.shadows[index].offsetY = newValue;
      });
    }
    case 'setShadowBlur': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        if (!draft.shadows || !draft.shadows[index]) return;

        const newValue =
          mode === 'replace'
            ? amount
            : draft.shadows[index].blurRadius + amount;

        draft.shadows[index].blurRadius = newValue;
      });
    }
    case 'setShadowSpread': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (draft) => {
        if (!draft.shadows || !draft.shadows[index]) return;

        const newValue =
          mode === 'replace' ? amount : draft.shadows[index].spread + amount;

        draft.shadows[index].spread = newValue;
      });
    }
    case 'setBorderPosition': {
      const [, index, position] = action;

      return produce(state, (draft) => {
        if (!draft.borders || !draft.borders[index]) return;

        draft.borders[index].position = position;
      });
    }
    case 'setFillFillType': {
      const [, index, type] = action;
      return produce(state, (draft) => {
        if (!draft.fills || !draft.fills[index]) return;
        draft.fills[index].fillType = type;

        if (type === Sketch.FillType.Gradient && !draft.fills[index].gradient) {
          draft.fills[index].gradient = SketchModel.gradient();
        }
      });
    }
    case 'setBorderFillType': {
      const [, index, type] = action;
      return produce(state, (draft) => {
        if (!draft.borders || !draft.borders![index]) return;
        draft.borders[index].fillType = type;

        if (!draft.borders[index].gradient) {
          draft.borders[index].gradient = SketchModel.gradient();
        }
      });
    }
    case 'setFillGradientColor':
    case 'setFillGradientPosition':
    case 'setFillGradientType':
    case 'addFillGradientStop':
    case 'setFillGradientFrom':
    case 'setFillGradientTo':
    case 'deleteFillGradientStop':
    case 'setFillGradient': {
      const [, index] = action;
      return produce(state, (draft) => {
        if (!draft.fills || !draft.fills[index]) return;

        draft.fills[index].gradient = gradientReducer(
          draft.fills[index].gradient,
          action,
        );
      });
    }
    case 'setBorderGradientColor':
    case 'setBorderGradientPosition':
    case 'setBorderGradientType':
    case 'addBorderGradientStop':
    case 'deleteBorderGradientStop':
    case 'setBorderGradient': {
      const [, index] = action;
      return produce(state, (draft) => {
        if (!draft.borders || !draft.borders[index]) return;

        draft.borders[index].gradient = gradientReducer(
          draft.borders[index].gradient,
          action,
        );
      });
    }
    case 'setColorControlsEnabled':
    case 'setHue':
    case 'setSaturation':
    case 'setBrightness':
    case 'setContrast':
      return produce(state, (draft) => {
        draft.colorControls = colorControlsReducer(draft.colorControls, action);
      });
    case 'setBlurEnabled':
    case 'setBlurRadius':
    case 'setBlurType':
      return produce(state, (draft) => {
        draft.blur = blurReducer(draft.blur, action);
      });
    case 'setPatternFillType': {
      const [, index, value] = action;
      return produce(state, (draft) => {
        if (!draft.fills || !draft.fills[index]) return;

        draft.fills[index].patternFillType = value;
      });
    }
    case 'setPatternTileScale': {
      const [, index, amount, mode = 'replace'] = action;
      return produce(state, (draft) => {
        if (!draft.fills || !draft.fills[index]) return;

        const newValue =
          mode === 'replace'
            ? amount
            : draft.fills[index].patternTileScale + amount;

        draft.fills[index].patternTileScale = clamp(newValue, 0.1, 2);
      });
    }
    case 'setFillImage': {
      const [, index, value] = action;
      return produce(state, (draft) => {
        if (!draft.fills || !draft.fills[index]) return;

        draft.fills[index].image = value;
      });
    }
    case 'setFillContextSettingsOpacity': {
      const [, index, amount, mode = 'replace'] = action;
      return produce(state, (draft) => {
        if (!draft.fills || !draft.fills[index]) return;
        const newValue =
          mode === 'replace'
            ? amount
            : draft.fills[index].contextSettings.opacity + amount;

        draft.fills[index].contextSettings.opacity = clamp(newValue, 0, 1);
      });
    }
    default:
      return state;
  }
}
