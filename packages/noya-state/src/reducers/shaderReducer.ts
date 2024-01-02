import { Sketch } from '@noya-app/noya-file-format';
import produce from 'immer';
import { SketchModel } from 'noya-sketch-model';

export type ShaderAction =
  | [type: 'setShaderString', index: number, value: string]
  | [
      type: 'setShaderVariableName',
      index: number,
      oldName: string,
      newName: string,
    ]
  | [
      type: 'setShaderVariableValue',
      index: number,
      name: string,
      value: Sketch.ShaderVariable['value'],
    ]
  | [
      type: 'nudgeShaderVariableValue',
      index: number,
      name: string,
      amount: number,
    ]
  | [type: 'addShaderVariable', index: number]
  | [type: 'deleteShaderVariable', index: number, name: string];

export function shaderReducer(
  state: Sketch.Shader | undefined,
  action: ShaderAction,
): Sketch.Shader {
  state = state ?? SketchModel.shader();

  switch (action[0]) {
    case 'setShaderString': {
      const [, , value] = action;

      return produce(state, (draft) => {
        draft.shaderString = value;
      });
    }
    case 'setShaderVariableName': {
      const [, , name, newName] = action;

      const index = state.variables.findIndex(
        (variable) => variable.name === name,
      );

      if (index === -1) return state;

      return produce(state, (draft) => {
        draft.variables[index].name = newName;
      });
    }
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
    case 'nudgeShaderVariableValue': {
      const [, , name, amount] = action;

      const index = state.variables.findIndex(
        (variable) => variable.name === name,
      );

      if (index === -1) return state;

      return produce(state, (draft) => {
        const value = draft.variables[index].value;
        switch (value.type) {
          case 'float':
          case 'integer':
            value.data += amount;
            break;
          default:
            break;
        }
      });
    }
    case 'addShaderVariable': {
      return produce(state, (draft) => {
        draft.variables.push(
          SketchModel.shaderVariable({
            name: `variable${draft.variables.length + 1}`,
          }),
        );
      });
    }
    case 'deleteShaderVariable': {
      const [, , name] = action;

      const index = state.variables.findIndex(
        (variable) => variable.name === name,
      );

      if (index === -1) return state;

      return produce(state, (draft) => {
        draft.variables.splice(index, 1);
      });
    }
    default:
      return state;
  }
}
