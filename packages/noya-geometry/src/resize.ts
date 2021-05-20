import { Rect, Size } from './types';

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
