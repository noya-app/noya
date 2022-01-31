import { useMemo } from 'react';

import { CanvasKit, RuntimeEffect } from 'canvaskit';
import { SketchModel } from 'noya-sketch-model';
import Sketch from 'noya-file-format';
import { getSkiaShaderString } from '../shaders';
import { useCanvasKit } from './useCanvasKit';

type CompiledShader =
  | { type: 'ok'; value: RuntimeEffect }
  | { type: 'error'; value: string };

export function compileShader(
  CanvasKit: CanvasKit,
  shader: Sketch.Shader,
): CompiledShader {
  let compilerErrors: string = '';

  const runtimeEffect =
    CanvasKit.RuntimeEffect.Make(
      getSkiaShaderString(shader.shaderString, [
        ...shader.variables,
        SketchModel.shaderVariable({
          name: 'iTime',
          value: { type: 'float', data: 0 },
        }),
      ]),
      (errors) => {
        compilerErrors = errors
          .replace('1 error', '')
          .replace(/error: \d+: /, '');
      },
    ) ?? undefined;

  return runtimeEffect
    ? { type: 'ok', value: runtimeEffect }
    : { type: 'error', value: compilerErrors };
}

export function useCompileShader(shader: Sketch.Shader): CompiledShader {
  const CanvasKit = useCanvasKit();

  return useMemo(() => compileShader(CanvasKit, shader), [CanvasKit, shader]);
}
