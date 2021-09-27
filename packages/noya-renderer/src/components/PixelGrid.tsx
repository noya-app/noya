import { CanvasKit, Image } from 'canvaskit';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { AffineTransform } from 'noya-geometry';
import { useDeletable } from 'noya-react-canvaskit';
import { Rect, useCanvasKit, useZoom } from 'noya-renderer';
import { Selectors } from 'noya-state';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { drawImage } from '../utils/drawImage';

function getGridImage(CanvasKit: CanvasKit, size: number, color: string) {
  return drawImage(CanvasKit, { width: size, height: size }, (canvas) => {
    const paint = new CanvasKit.Paint();

    paint.setColor(CanvasKit.parseColorString(color));

    canvas.drawRect(CanvasKit.XYWHRect(0, 0, 1, size), paint);
    canvas.drawRect(CanvasKit.XYWHRect(0, 0, size, 1), paint);
  });
}

export function PixelGrid() {
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const [state] = useApplicationState();
  const { canvasSize } = useWorkspace();
  const { scrollOrigin } = Selectors.getCurrentPageMetadata(state);
  const gridColor = useTheme().colors.canvas.grid;

  const gridRect = useMemo(
    () => CanvasKit.XYWHRect(0, 0, canvasSize.width, canvasSize.height),
    [CanvasKit, canvasSize.height, canvasSize.width],
  );

  const roundedZoom = Math.ceil(zoom);

  const image = useMemo((): Image | undefined => {
    if (roundedZoom < 10) return;

    return getGridImage(CanvasKit, roundedZoom, gridColor);
  }, [CanvasKit, gridColor, roundedZoom]);

  const paint = useMemo(() => {
    if (!image) return;

    const paint = new CanvasKit.Paint();

    const imageShader = image.makeShaderCubic(
      CanvasKit.TileMode.Repeat,
      CanvasKit.TileMode.Repeat,
      0,
      0,
      AffineTransform.scale(zoom / roundedZoom, zoom / roundedZoom).translate(
        scrollOrigin.x,
        scrollOrigin.y,
      ).float32Array,
    );

    paint.setShader(imageShader);

    return paint;
  }, [
    CanvasKit.Paint,
    CanvasKit.TileMode.Repeat,
    image,
    roundedZoom,
    scrollOrigin.x,
    scrollOrigin.y,
    zoom,
  ]);

  useDeletable(paint);

  return <>{paint && <Rect rect={gridRect} paint={paint} />}</>;
}
