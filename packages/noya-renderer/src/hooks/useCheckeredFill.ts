import { useDeletable, useReactCanvasKit } from 'noya-react-canvaskit';
import { useMemo } from 'react';
import { useTheme } from 'styled-components';

// A simple, unoptimized decoder for small images
function decodeBase64(string: string) {
  return new Uint8Array(
    atob(string)
      .split('')
      .map((char) => char.charCodeAt(0)),
  );
}

const CHECKERED_BACKGROUND = `iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABNJREFUCNdjYOD/TxL+/4GBFAwAvMsj3bQ3H74AAAAASUVORK5CYII=`;
export const CHECKERED_BACKGROUND_BYTES = decodeBase64(CHECKERED_BACKGROUND);

export default function useCheckeredFill() {
  const { CanvasKit } = useReactCanvasKit();
  const { transparentChecker } = useTheme().colors;

  const paint = useMemo(() => {
    const paint = new CanvasKit.Paint();
    const image = CanvasKit.MakeImageFromEncoded(CHECKERED_BACKGROUND_BYTES);

    if (!image) return paint;

    const imageShader = image.makeShaderCubic(
      CanvasKit.TileMode.Repeat,
      CanvasKit.TileMode.Repeat,
      0,
      0,
      CanvasKit.Matrix.scaled(0.5, 0.5),
    );

    const colorShader = CanvasKit.Shader.MakeColor(
      CanvasKit.parseColorString(transparentChecker),
      CanvasKit.ColorSpace.SRGB,
    );

    paint.setShader(
      CanvasKit.Shader.MakeBlend(
        CanvasKit.BlendMode.DstATop,
        colorShader,
        imageShader,
      ),
    );

    return paint;
  }, [CanvasKit, transparentChecker]);

  useDeletable(paint);

  return paint;
}
