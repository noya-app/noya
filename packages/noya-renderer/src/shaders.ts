import Sketch from 'noya-file-format';

function getVariableUniformDeclaration({ name, value }: Sketch.ShaderVariable) {
  switch (value.type) {
    case 'integer':
      return `uniform int ${name};`;
    case 'float':
      return `uniform float ${name};`;
    case 'color':
      return `uniform float4 ${name};`;
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
