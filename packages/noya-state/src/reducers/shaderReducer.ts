import produce from 'immer';
import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';

export type ShaderAction =
  | [
      type: 'setShaderVariableValue',
      index: number,
      name: string,
      value: Sketch.ShaderVariable['value'],
    ];

export function shaderReducer(
  state: Sketch.Shader | undefined,
  action: ShaderAction,
): Sketch.Shader {
  state = state ?? SketchModel.shader();

  switch (action[0]) {
    case 'setShaderVariableValue': {
      const [, , name, value] = action;

      const index = state.variables.findIndex(
        (variable) => variable.name === name,
      );

      if (index === -1) return state;

      return produce(state, (draft) => {
        draft.variables[index].value = value;
      });
    }
    default:
      return state;
  }
}
