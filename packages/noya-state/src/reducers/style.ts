import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import * as Models from '../models';

export type SetNumberMode = 'replace' | 'adjust';

export type StyleElementType = 'Fill' | 'Border' | 'Shadow';

export type StyleShadowType = 'X' | 'Y' | 'Blur' | 'Spread';

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
      type: `setShadow${StyleShadowType}`,
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [type: 'setOpacity', amount: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode]
  | [type: `set${StyleElementType}Color`, index: number, value: Sketch.Color];

export function styleReducer(
  state: Sketch.Style,
  action: StyleAction,
): Sketch.Style {
  switch (action[0]) {
    case 'addNewBorder':
      return produce(state, (state) => {
        if (state.borders) {
          state.borders.unshift(Models.border);
        } else {
          state.borders = [Models.border];
        }
      });
    case 'addNewFill':
      return produce(state, (state) => {
        if (state.fills) {
          state.fills.unshift(Models.fill);
        } else {
          state.fills = [Models.fill];
        }
      });
    case 'addNewShadow':
      return produce(state, (state) => {
        if (state.shadows) {
          state.shadows.unshift(Models.shadow);
        } else {
          state.shadows = [Models.shadow];
        }
      });
    case 'setBorderEnabled': {
      const [, index, isEnabled] = action;
      return produce(state, (state) => {
        if (state.borders && state.borders[index]) {
          state.borders[index].isEnabled = isEnabled;
        }
      });
    }
    case 'setFillEnabled': {
      const [, index, isEnabled] = action;
      return produce(state, (state) => {
        if (state.fills && state.fills[index]) {
          state.fills[index].isEnabled = isEnabled;
        }
      });
    }
    case 'setShadowEnabled': {
      const [, index, isEnabled] = action;
      return produce(state, (state) => {
        if (state.shadows && state.shadows[index]) {
          state.shadows[index].isEnabled = isEnabled;
        }
      });
    }
    case 'deleteBorder':
      return produce(state, (state) => {
        if (state.borders) {
          state.borders.splice(action[1], 1);
        }
      });
    case 'deleteFill':
      return produce(state, (state) => {
        if (state.fills) {
          state.fills.splice(action[1], 1);
        }
      });
    case 'deleteShadow':
      return produce(state, (state) => {
        if (state.shadows) {
          state.shadows.splice(action[1], 1);
        }
      });
    case 'moveBorder': {
      const [, sourceIndex, destinationIndex] = action;
      return produce(state, (state) => {
        if (state.borders) {
          const sourceItem = state.borders[sourceIndex];

          state.borders.splice(sourceIndex, 1);
          state.borders.splice(destinationIndex, 0, sourceItem);
        }
      });
    }
    case 'moveFill': {
      const [, sourceIndex, destinationIndex] = action;
      return produce(state, (state) => {
        if (state.fills) {
          const sourceItem = state.fills[sourceIndex];

          state.fills.splice(sourceIndex, 1);
          state.fills.splice(destinationIndex, 0, sourceItem);
        }
      });
    }
    case 'moveShadow': {
      const [, sourceIndex, destinationIndex] = action;
      return produce(state, (state) => {
        if (state.shadows) {
          const sourceItem = state.shadows[sourceIndex];

          state.shadows.splice(sourceIndex, 1);
          state.shadows.splice(destinationIndex, 0, sourceItem);
        }
      });
    }
    case 'deleteDisabledBorders':
      return produce(state, (state) => {
        if (state.borders) {
          state.borders = state.borders.filter((border) => border.isEnabled);
        }
      });
    case 'deleteDisabledFills':
      return produce(state, (state) => {
        if (state.fills) {
          state.fills = state.fills.filter((fill) => fill.isEnabled);
        }
      });
    case 'deleteDisabledShadows':
      return produce(state, (state) => {
        if (state.shadows) {
          state.shadows = state.shadows.filter((fill) => fill.isEnabled);
        }
      });
    case 'setBorderColor': {
      const [, index, color] = action;
      return produce(state, (state) => {
        if (state.borders && state.borders[index]) {
          state.borders[index].color = color;
        }
      });
    }
    case 'setFillColor': {
      const [, index, color] = action;
      return produce(state, (state) => {
        if (state.fills && state.fills[index]) {
          state.fills[index].color = color;
        }
      });
    }
    case 'setShadowColor': {
      const [, index, color] = action;
      return produce(state, (state) => {
        if (state.shadows && state.shadows[index]) {
          state.shadows[index].color = color;
        }
      });
    }
    case 'setBorderWidth': {
      const [, index, amount, mode = 'replace'] = action;
      return produce(state, (state) => {
        if (state.borders && state.borders[index]) {
          const newValue =
            mode === 'replace'
              ? amount
              : state.borders[index].thickness + amount;

          state.borders[index].thickness = Math.max(0, newValue);
        }
      });
    }
    case 'setFillOpacity': {
      const [, index, amount, mode = 'replace'] = action;
      return produce(state, (state) => {
        if (state.fills && state.fills[index]) {
          const newValue =
            mode === 'replace'
              ? amount
              : state.fills[index].color.alpha + amount;

          state.fills[index].color.alpha = Math.min(Math.max(0, newValue), 1);
        }
      });
    }
    case 'setOpacity': {
      const [, amount, mode = 'replace'] = action;
      return produce(state, (state) => {
        if (state && state.contextSettings) {
          const newValue =
            mode === 'replace'
              ? amount
              : state.contextSettings.opacity + amount;

          state.contextSettings.opacity = Math.min(Math.max(0, newValue), 1);
        }
      });
    }
    case 'setShadowX': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (state) => {
        if (state && state.shadows && state.shadows[index]) {
          const newValue =
            mode === 'replace' ? amount : state.shadows[index].offsetX + amount;

          state.shadows[index].offsetX = newValue;
        }
      });
    }
    case 'setShadowY': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (state) => {
        if (state && state.shadows && state.shadows[index]) {
          const newValue =
            mode === 'replace' ? amount : state.shadows[index].offsetY + amount;

          state.shadows[index].offsetY = newValue;
        }
      });
    }
    case 'setShadowBlur': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (state) => {
        if (state && state.shadows && state.shadows[index]) {
          const newValue =
            mode === 'replace'
              ? amount
              : state.shadows[index].blurRadius + amount;

          state.shadows[index].blurRadius = newValue;
        }
      });
    }
    case 'setShadowSpread': {
      const [, index, amount, mode = 'replace'] = action;

      return produce(state, (state) => {
        if (state && state.shadows && state.shadows[index]) {
          const newValue =
            mode === 'replace' ? amount : state.shadows[index].spread + amount;

          state.shadows[index].spread = newValue;
        }
      });
    }
    case 'setBorderPosition': {
      const [, index, position] = action;

      return produce(state, (state) => {
        if (state && state.borders && state.borders[index]) {
          state.borders[index].position = position;
        }
      });
    }
    default:
      return state;
  }
}
