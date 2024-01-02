import { Sketch } from '@noya-app/noya-file-format';
import produce from 'immer';

export type StyleElementType = 'Fill' | 'Border';

export type GradientAction =
  | [
      type: `set${StyleElementType}FillType`,
      index: number,
      value: Sketch.FillType,
    ]
  | [
      type: `set${StyleElementType}Gradient`,
      index: number,
      value: Sketch.Gradient,
    ]
  | [
      type: `set${StyleElementType}GradientColor`,
      index: number,
      gradientIndex: number,
      value: Sketch.Color,
    ]
  | [
      type: `set${StyleElementType}GradientPosition`,
      index: number,
      gradientIndex: number,
      value: number,
    ]
  | [
      type: `add${StyleElementType}GradientStop`,
      index: number,
      color: Sketch.Color,
      position: number,
    ]
  | [
      type: `delete${StyleElementType}GradientStop`,
      index: number,
      stopIndex: number,
    ]
  | [
      type: `set${StyleElementType}GradientType`,
      index: number,
      value: Sketch.GradientType,
    ]
  | [type: `set${StyleElementType}GradientFrom`, index: number, value: string]
  | [type: `set${StyleElementType}GradientTo`, index: number, value: string];

export function gradientReducer(
  state: Sketch.Gradient,
  action: GradientAction,
): Sketch.Gradient {
  switch (action[0]) {
    case 'setFillGradientColor':
    case 'setBorderGradientColor': {
      const [, , stopIndex, color] = action;

      return produce(state, (draft) => {
        if (!draft || !draft.stops[stopIndex]) return;

        draft.stops[stopIndex].color = color;
      });
    }
    case 'setFillGradientPosition':
    case 'setBorderGradientPosition': {
      const [, , stopIndex, position] = action;

      return produce(state, (draft) => {
        if (!draft || !draft.stops[stopIndex]) return;
        draft.stops[stopIndex].position = position;
        draft.stops.sort((a, b) => a.position - b.position);
      });
    }
    case 'addFillGradientStop':
    case 'addBorderGradientStop': {
      const [, , color, position] = action;

      return produce(state, (draft) => {
        if (!draft) return;

        draft.stops.push({
          _class: 'gradientStop',
          color,
          position,
        });
        draft.stops.sort((a, b) => a.position - b.position);
      });
    }
    case 'setFillGradientType':
    case 'setBorderGradientType': {
      const [, , value] = action;

      return produce(state, (draft) => {
        if (!draft) return;
        draft.gradientType = value;
      });
    }
    case 'deleteFillGradientStop':
    case 'deleteBorderGradientStop': {
      const [, , index] = action;

      return produce(state, (draft) => {
        if (!draft) return;
        draft.stops.splice(index, 1);
      });
    }
    case 'setFillGradient':
    case 'setBorderGradient': {
      const [, , gradient] = action;

      return gradient;
    }
    case 'setFillGradientFrom':
    case 'setBorderGradientFrom': {
      const [, , point] = action;

      return produce(state, (draft) => {
        if (!draft) return;
        draft.from = point;
      });
    }
    case 'setFillGradientTo':
    case 'setBorderGradientTo': {
      const [, , point] = action;

      return produce(state, (draft) => {
        if (!draft) return;
        draft.to = point;
      });
    }
    default:
      return state;
  }
}
