import { Sketch } from '@noya-app/noya-file-format';

function getVariableUniformDeclaration({ name, value }: Sketch.ShaderVariable) {
  switch (value.type) {
    case 'integer':
      return `uniform int ${name};`;
    case 'float':
      return `uniform float ${name};`;
    case 'float2':
      return `uniform float2 ${name};`;
    case 'color':
      return `uniform float4 ${name};`;
    default:
      throw new Error(
        `Unsupported shader variable type: ${JSON.stringify(value)}`,
      );
  }
}

export function getUniformDeclarations(variables: Sketch.ShaderVariable[]) {
  return variables.map(getVariableUniformDeclaration).join('\n');
}

export function getVariableUniformValues({ value }: Sketch.ShaderVariable) {
  switch (value.type) {
    case 'integer':
    case 'float':
      return [value.data];
    case 'float2':
      return [value.data.x, value.data.y];
    case 'color':
      const { red, green, blue, alpha } = value.data;
      return [red, green, blue, alpha];
    default:
      return [];
  }
}

export function getUniformValues(variables: Sketch.ShaderVariable[]): number[] {
  return variables.flatMap(getVariableUniformValues);
}

export function getSkiaShaderString(
  shaderString: string,
  variables: Sketch.ShaderVariable[],
): string {
  return [getUniformDeclarations(variables), shaderString].join('\n\n');
}
