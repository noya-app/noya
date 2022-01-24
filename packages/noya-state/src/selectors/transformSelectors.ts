import { IndexPath } from 'tree-visit';

import type Sketch from 'noya-file-format';
import { AffineTransform, createBounds, Insets } from 'noya-geometry';
import { ApplicationState, Layers } from '../index';
import { getCurrentPageMetadata } from './pageSelectors';
import { toRadians } from '../utils/radians';

export function getLayerTransform(
  ctm: AffineTransform,
  layer: Sketch.AnyLayer,
): AffineTransform {
  const flip = getLayerFlipTransform(layer);
  const rotation = getLayerRotationTransform(layer);
  const translation = getLayerTranslationTransform(layer);

  return AffineTransform.multiply(ctm, flip, rotation, translation);
}

export function getLayerFlipTransform(layer: Sketch.AnyLayer) {
  if (!layer.isFlippedHorizontal && !layer.isFlippedVertical)
    return AffineTransform.identity;

  const bounds = createBounds(layer.frame);

  return AffineTransform.multiply(
    AffineTransform.translate(bounds.midX, bounds.midY),
    AffineTransform.scale(
      layer.isFlippedHorizontal ? -1 : 1,
      layer.isFlippedVertical ? -1 : 1,
    ),
    AffineTransform.translate(-bounds.midX, -bounds.midY),
  );
}

export function getLayerTranslationTransform(
  layer: Sketch.AnyLayer,
): AffineTransform {
  return AffineTransform.translate(layer.frame.x, layer.frame.y);
}

export function getLayerRotationTransform(
  layer: Sketch.AnyLayer,
): AffineTransform {
  const bounds = createBounds(layer.frame);
  const midpoint = { x: bounds.midX, y: bounds.midY };
  const rotation = getLayerRotationRadians(layer);

  return AffineTransform.rotate(rotation, midpoint);
}

export function getLayerTransformAtIndexPath(
  node: Sketch.Page,
  indexPath: IndexPath,
  ctm: AffineTransform = AffineTransform.identity,
  behavior?: 'includeLast',
): AffineTransform {
  const path = Layers.accessPath(node, indexPath).slice(
    1,
    behavior === 'includeLast' ? undefined : -1,
  );

  return path.reduce((result, layer) => getLayerTransform(result, layer), ctm);
}

export function getLayerTransformAtIndexPathReversed(
  node: Sketch.AnyLayer,
  indexPath: IndexPath,
  ctm: AffineTransform = AffineTransform.identity,
): AffineTransform {
  const path = Layers.accessPathReversed(node, indexPath).slice(1, -1);

  return path.reduce((result, layer) => getLayerTransform(result, layer), ctm);
}

export function getLayerRotationMultiplier(): number {
  return -1;
}

/**
 * Clamp rotation within the range [-180, 360)
 *
 * -1801  => -1
 * -181   =>  179
 * -180   =>  180
 * -179   => -179
 *  45    =>  45
 *  360   =>  0
 *  3601  =>  1
 */
export function clampRotation(rotation: number) {
  if (rotation <= -180) {
    // Round toward the positive direction
    return rotation + 360 * Math.round(-rotation / 360);
  } else if (rotation >= 360) {
    return rotation - 360 * Math.floor(rotation / 360);
  } else {
    return rotation;
  }
}

export function getLayerRotation(layer: Sketch.AnyLayer): number {
  return clampRotation(layer.rotation * getLayerRotationMultiplier());
}

export function getLayerRotationRadians(layer: Sketch.AnyLayer): number {
  return toRadians(getLayerRotation(layer));
}

export function getScreenTransform(insets: Insets) {
  return AffineTransform.translate(insets.left, insets.top);
}

export function getCanvasTransform(state: ApplicationState, insets: Insets) {
  const { scrollOrigin, zoomValue } = getCurrentPageMetadata(state);

  return AffineTransform.multiply(
    getScreenTransform(insets),
    AffineTransform.translate(scrollOrigin.x, scrollOrigin.y),
    AffineTransform.scale(zoomValue),
  );
}
