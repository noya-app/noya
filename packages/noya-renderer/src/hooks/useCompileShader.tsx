import { Sketch } from '@noya-app/noya-file-format';
import { SketchModel } from '@noya-app/noya-sketch-model';
import { CanvasKit, RuntimeEffect } from 'canvaskit';
import { useMemo } from 'react';
import { getSkiaShaderString } from '../shaders';
import { useCanvasKit } from './useCanvasKit';

type CompiledShader =
  | { type: 'ok'; value: RuntimeEffect }
  | { type: 'error'; value: string };

export function compileShader(
  CanvasKit: CanvasKit,
  shader: Sketch.Shader,
): CompiledShader {
  let compilerErrors = '';

  const runtimeEffect =
    CanvasKit.RuntimeEffect.Make(
      getSkiaShaderString(shader.shaderString, [
        ...shader.variables,
        SketchModel.shaderVariable({
          name: 'iTime',
          value: { type: 'float', data: 0 },
        }),
        SketchModel.shaderVariable({
          name: 'iResolution',
          value: {
            type: 'float2',
            data: { x: 1, y: 1 },
          },
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
