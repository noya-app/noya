import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';

export type StyleElementType = 'Fill' | 'Border';

export type GradientAction =
  | [
      type: `set${StyleElementType}FillType`,
      index: number,
      value: Sketch.FillType,
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
    ];

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
        /*TODO >>> Sort the stops by position
         draft.fills[fillIndex].gradient.stops.sort(
          (a, b) => a.position - b.position,
        );  */
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
    default:
      return state;
  }
}
