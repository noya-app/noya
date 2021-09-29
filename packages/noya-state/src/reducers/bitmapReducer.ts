import { Canvas, CanvasKit, Image, Paint } from 'canvaskit';
import produce from 'immer';
import Sketch from 'noya-file-format';
import {
  createBounds,
  createRectFromBounds,
  Point,
  rectContainsPoint,
  Size,
} from 'noya-geometry';
import { drawBase64PNG } from 'noya-renderer';
import { PointString } from 'noya-sketch-model';
import {
  ApplicationReducerContext,
  ApplicationState,
  Primitives,
  ScalingOptions,
  Selectors,
} from 'noya-state';
import { Base64, isDeepEqual } from 'noya-utils';
import { PixelBuffer } from 'pixelbuffer';
import * as Layers from '../layers';

export type BitmapAction = [type: 'setPixel'];

export function bitmapReducer(
  state: ApplicationState,
  action: BitmapAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'setPixel': {
      if (state.interactionState.type !== 'editBitmap') return state;

      const {
        currentColor: color,
        editBitmapTool: tool,
        editBitmapState: editState,
      } = state.interactionState;

      if (editState.type !== 'drawing') return state;

      const bitmapLayers = Selectors.getSelectedLayers(state).filter(
        Layers.isBitmapLayer,
      );

      const firstBitmapLayer = bitmapLayers[0];

      if (!firstBitmapLayer) return state;

      const indexPath = Layers.findIndexPath(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === firstBitmapLayer.do_objectID,
      );

      if (!indexPath) return state;

      const boundingRect = Selectors.getBoundingRect(
        Selectors.getCurrentPage(state),
        [firstBitmapLayer.do_objectID],
        { artboards: 'childrenOnly', groups: 'childrenOnly' },
      );

      const point = editState.current;

      if (!boundingRect || !point || !rectContainsPoint(boundingRect, point))
        return state;

      const pixel: Point = {
        x: Math.floor(point.x - boundingRect.x),
        y: Math.floor(point.y - boundingRect.y),
      };

      const scalingOptions: ScalingOptions = {
        constrainProportions: state.keyModifiers.shiftKey,
        scalingOriginMode: state.keyModifiers.altKey ? 'center' : 'extent',
      };

      return produce(state, (draft) => {
        const layer = Layers.access(
          Selectors.getCurrentPage(draft),
          indexPath,
        ) as Sketch.Bitmap;

        if (layer.image._class === 'MSJSONOriginalDataReference') {
          const originalImage = CanvasKit.MakeImageFromEncoded(
            Base64.decode(layer.image.data._data),
          );

          if (!originalImage) return;

          const width = originalImage.width();
          const height = originalImage.height();

          const pixelPaint = new CanvasKit.Paint();
          pixelPaint.setColor(Primitives.color(CanvasKit, color));

          let data = drawBase64PNG(CanvasKit, { width, height }, (canvas) => {
            canvas.drawImage(originalImage, 0, 0, new CanvasKit.Paint());

            switch (tool.type) {
              case 'pencil': {
                fillPixel(
                  CanvasKit,
                  canvas,
                  pixel,
                  color.alpha < 1,
                  pixelPaint,
                );

                break;
              }
              case 'rectangle': {
                fillRectPixels(
                  CanvasKit,
                  canvas,
                  { width, height },
                  editState.origin,
                  editState.current,
                  scalingOptions,
                  color.alpha < 1,
                  pixelPaint,
                );

                break;
              }
              case 'paintBucket': {
                floodFill(
                  CanvasKit,
                  canvas,
                  originalImage,
                  { width, height },
                  pixel,
                  color.alpha < 1,
                  pixelPaint,
                );

                break;
              }
            }
          });

          if (!data) return;

          layer.image.data._data = data;
        }
      });
    }
    default:
      return state;
  }
}

function fillPixel(
  CanvasKit: CanvasKit,
  canvas: Canvas,
  pixel: Point,
  clear: boolean,
  paint: Paint,
) {
  const pixelRect = CanvasKit.XYWHRect(pixel.x, pixel.y, 1, 1);

  if (clear) {
    canvas.save();
    canvas.clipRect(pixelRect, CanvasKit.ClipOp.Intersect, false);
    canvas.clear(CanvasKit.TRANSPARENT);
    canvas.restore();
  }

  canvas.drawRect(pixelRect, paint);
}

export function fillRectPixels(
  CanvasKit: CanvasKit,
  canvas: Canvas,
  imageSize: Size,
  origin: Point,
  current: Point,
  scalingOptions: ScalingOptions,
  clear: boolean,
  paint: Paint,
) {
  let rect = Selectors.getDrawnLayerRect(origin, current, scalingOptions);

  const bounds = createBounds(rect);

  bounds.minX = Math.floor(bounds.minX);
  bounds.minY = Math.floor(bounds.minY);
  bounds.maxX = Math.ceil(bounds.maxX);
  bounds.maxY = Math.ceil(bounds.maxY);

  rect = createRectFromBounds(bounds);

  if (scalingOptions.constrainProportions) {
    const size = Math.max(rect.width, rect.height);
    rect.width = size;
    rect.height = size;
  }

  const path = new CanvasKit.Path();

  path.addRect(Primitives.rect(CanvasKit, rect));

  for (let x = 0; x < imageSize.width; x++) {
    for (let y = 0; y < imageSize.height; y++) {
      if (path.contains(x + 0.5, y + 0.5)) {
        fillPixel(CanvasKit, canvas, { x, y }, clear, paint);
      }
    }
  }

  path.delete();
}

function floodFill(
  CanvasKit: CanvasKit,
  canvas: Canvas,
  originalImage: Image,
  imageSize: Size,
  pixel: Point,
  clear: boolean,
  paint: Paint,
) {
  const colorSpace = originalImage.getColorSpace();

  const pixels = originalImage.readPixels(0, 0, {
    ...originalImage.getImageInfo(),
    colorSpace,
  }) as Uint8Array | null;

  if (!pixels) return;

  const pixelBuffer = PixelBuffer.create(
    {
      width: imageSize.width,
      height: imageSize.height,
      bytesPerPixel: 4,
    },
    pixels,
  );

  const existingColor = pixelBuffer.getPixel(pixel);

  const visited = new Set<string>();
  const pointsToFill: Point[] = [];
  const pointsToCheck: Point[] = [pixel];

  while (pointsToCheck.length > 0) {
    const point = pointsToCheck.pop()!;

    const pointString = PointString.encode(point);
    visited.add(pointString);

    const colorAtPoint = pixelBuffer.getPixel(point);

    if (isDeepEqual(colorAtPoint, existingColor)) {
      pointsToFill.push(point);

      const left = { x: point.x - 1, y: point.y };
      const right = { x: point.x + 1, y: point.y };
      const up = { x: point.x, y: point.y - 1 };
      const down = { x: point.x, y: point.y + 1 };

      [left, right, up, down].forEach((adjacentPoint) => {
        if (
          adjacentPoint.x >= 0 &&
          adjacentPoint.x <= imageSize.width - 1 &&
          adjacentPoint.y >= 0 &&
          adjacentPoint.y <= imageSize.height - 1 &&
          !visited.has(PointString.encode(adjacentPoint))
        ) {
          pointsToCheck.push(adjacentPoint);
        }
      });
    }
  }

  pointsToFill.forEach((point) => {
    fillPixel(CanvasKit, canvas, point, clear, paint);
  });
}
