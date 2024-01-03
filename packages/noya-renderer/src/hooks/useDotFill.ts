import { Sketch } from '@noya-app/noya-file-format';
import { Rect } from '@noya-app/noya-geometry';
import { SketchModel } from '@noya-app/noya-sketch-model';
import { useDeletable } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import { useMemo } from 'react';
import { getUniformValues } from '../shaders';
import { useCanvasKit } from './useCanvasKit';
import { compileShader } from './useCompileShader';

export function useDotFill({
  gridSize,
  frame,
  backgroundColor,
  foregroundColor,
}: {
  gridSize: number;
  frame: Rect;
  backgroundColor: Sketch.Color;
  foregroundColor: Sketch.Color;
}) {
  const CanvasKit = useCanvasKit();

  const dotShaderObject = useMemo(() => {
    return SketchModel.shader({
      variables: [
        SketchModel.shaderVariable({
          name: 'gridSize',
          value: { type: 'float', data: gridSize },
        }),
        SketchModel.shaderVariable({
          name: 'backgroundColor',
          value: {
            type: 'color',
            data: backgroundColor,
          },
        }),
        SketchModel.shaderVariable({
          name: 'foregroundColor',
          value: {
            type: 'color',
            data: foregroundColor,
          },
        }),
      ],
      shaderString: `
        float4 main(float2 position) {
          bool show = mod(position.x, gridSize) < 1.0 && mod(position.y, gridSize) < 1.0 ;
          return show ? mix(foregroundColor, backgroundColor, 0.8) : backgroundColor;
        }
      `,
    });
  }, [backgroundColor, foregroundColor, gridSize]);

  const runtimeEffect = useMemo(() => {
    const compiled = compileShader(CanvasKit, dotShaderObject);

    return compiled.type === 'ok' ? compiled.value : undefined;
  }, [CanvasKit, dotShaderObject]);

  const paint = useMemo(() => {
    if (!runtimeEffect) return new CanvasKit.Paint();

    const fill = SketchModel.fill({
      fillType: Sketch.FillType.Shader,
      patternFillType: Sketch.PatternFillType.Stretch,
      shader: dotShaderObject,
      contextSettings: SketchModel.graphicsContextSettings({
        blendMode: Sketch.BlendMode.Normal,
        opacity: 1,
      }),
    });

    const paint = Primitives.fill(
      CanvasKit,
      fill,
      frame,
      undefined,
      runtimeEffect,
      getUniformValues([
        ...fill.shader!.variables,
        SketchModel.shaderVariable({
          name: 'iTime',
          value: { type: 'float', data: 0 },
        }),
        SketchModel.shaderVariable({
          name: 'iResolution',
          value: {
            type: 'float2',
            data: { x: frame.width, y: frame.height },
          },
        }),
      ]),
    );

    return paint;
  }, [CanvasKit, dotShaderObject, frame, runtimeEffect]);

  useDeletable(paint);
  useDeletable(runtimeEffect);

  return paint;
}
