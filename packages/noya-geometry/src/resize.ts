import { AffineTransform } from './AffineTransform';
import { createBounds } from './rect';
import { Rect, ResizePosition, Size } from './types';

export function center(source: Size, destination: Size): Rect {
  return {
    x: (destination.width - source.width) / 2,
    y: (destination.height - source.height) / 2,
    width: source.width,
    height: source.height,
  };
}

export type ResizingMode = 'scaleToFill' | 'scaleAspectFill' | 'scaleAspectFit';

// https://github.com/Lona/studio/blob/f7160eba6aefbe8fc72267478d9d702bd8d73b8d/compiler/core/src/static/swift/CGSize%2BResizing.appkit.swift
export function resize(
  source: Size,
  destination: Size,
  resizingMode: ResizingMode = 'scaleAspectFit',
): Rect {
  const newSize = { ...destination };

  const sourceAspectRatio = source.height / source.width;
  const destinationAspectRatio = destination.height / destination.width;

  const sourceIsWiderThanDestination =
    sourceAspectRatio < destinationAspectRatio;

  switch (resizingMode) {
    case 'scaleAspectFit':
      if (sourceIsWiderThanDestination) {
        newSize.height = destination.width * sourceAspectRatio;
      } else {
        newSize.width = destination.height / sourceAspectRatio;
      }
      break;
    case 'scaleAspectFill':
      if (sourceIsWiderThanDestination) {
        newSize.width = destination.height / sourceAspectRatio;
      } else {
        newSize.height = destination.width * sourceAspectRatio;
      }
      break;
    case 'scaleToFill':
      break;
  }

  return center(newSize, destination);
}

export function resizeIfLarger(source: Size, destination: Size) {
  if (
    source.width <= destination.width &&
    source.height <= destination.height
  ) {
    return center(source, destination);
  }

  return resize(source, destination, 'scaleAspectFit');
}

export function getAnchorForResizePosition(position?: ResizePosition): {
  x: 'minX' | 'midX' | 'maxX';
  y: 'minY' | 'midY' | 'maxY';
} {
  switch (position) {
    case 'top':
      return { x: 'midX', y: 'minY' };
    case 'right top':
      return { x: 'maxX', y: 'minY' };
    case 'right':
      return { x: 'maxX', y: 'midY' };
    case 'right bottom':
      return { x: 'maxX', y: 'maxY' };
    case 'bottom':
      return { x: 'midX', y: 'maxY' };
    case 'left bottom':
      return { x: 'minX', y: 'maxY' };
    case 'left':
      return { x: 'minX', y: 'midY' };
    case 'left top':
      return { x: 'minX', y: 'minY' };
    default:
      return { x: 'midX', y: 'midY' };
  }
}

export function createResizeTransform(
  contentRect: Rect,
  containerSize: Size,
  {
    padding = 0,
    scalingMode = 'upOrDown',
    resizePosition,
  }: {
    padding?: number;
    scalingMode?: 'upOrDown' | 'down';
    resizePosition?: ResizePosition;
  } = {},
) {
  const bounds = createBounds(contentRect);

  const containerSizeMinusPadding = {
    width: containerSize.width - padding * 2,
    height: containerSize.height - padding * 2,
  };

  const containerBounds = createBounds(containerSizeMinusPadding);
  const anchor = getAnchorForResizePosition(resizePosition);

  const resizedContentRect =
    scalingMode === 'down'
      ? resizeIfLarger(contentRect, containerSizeMinusPadding)
      : resize(contentRect, containerSizeMinusPadding);

  const scale = {
    x: resizedContentRect.width / contentRect.width,
    y: resizedContentRect.height / contentRect.height,
  };

  const transform = AffineTransform.multiply(
    // Translate to the new position
    AffineTransform.translate(
      containerBounds[anchor.x] + padding,
      containerBounds[anchor.y] + padding,
    ),
    AffineTransform.scale(scale.x, scale.y),
    // Translate to (0,0) before scaling, since scale is applied at the origin
    AffineTransform.translate(-bounds[anchor.x], -bounds[anchor.y]),
  );

  return transform;
}
