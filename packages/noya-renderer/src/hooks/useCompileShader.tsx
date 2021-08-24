import { CanvasKit, RuntimeEffect } from 'canvaskit';
import Sketch from 'noya-file-format';
import { getSkiaShaderString, useCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { useMemo } from 'react';

type CompiledShader = { delete: () => void } & (
  | { type: 'ok'; value: RuntimeEffect }
  | { type: 'error'; value: string }
);

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
        compilerErrors = errors;
      },
    ) ?? undefined;

  const cleanup = () => {
    runtimeEffect?.delete();
  };

  return runtimeEffect
    ? { type: 'ok', value: runtimeEffect, delete: cleanup }
    : { type: 'error', value: compilerErrors, delete: cleanup };
}

export function useCompileShader(shader: Sketch.Shader): CompiledShader {
  const CanvasKit = useCanvasKit();

  return useMemo(() => compileShader(CanvasKit, shader), [CanvasKit, shader]);
}
