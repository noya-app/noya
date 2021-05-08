import type Sketch from '@sketch-hq/sketch-file-format-ts';
import type { CanvasKit } from 'canvaskit-wasm';
import {
  AffineTransform,
  createRectFromBounds,
  getRectCornerPoints,
  rectContainsPoint,
  rectsIntersect,
  rotatedRectContainsPoint,
  transformRect,
} from 'noya-geometry';
import { getDragHandles } from 'noya-renderer/src/canvas/selection';
import * as Primitives from 'noya-renderer/src/primitives';
import { EnterReturnValue, SKIP, STOP } from 'tree-visit';
import { ApplicationState, Layers, PageLayer } from '../index';
import { visitReversed } from '../layers';
import { ThemeTab, WorkspaceTab } from '../reducers/application';
import { CompassDirection } from '../reducers/interaction';
import { CanvasInsets } from '../reducers/workspace';
import type { Point, Rect, UUID } from '../types';
import {
  getSelectedLayerIndexPaths,
  getSelectedLayerIndexPathsExcludingDescendants,
} from './indexPathSelectors';
import { getCurrentPage, getCurrentPageIndex } from './pageSelectors';
import {
  getSelectedLayerStyles,
  getSelectedThemeTextStyles,
} from './themeSelectors';
import {
  getCanvasTransform,
  getLayerRotationTransform,
  getLayerTransformAtIndexPathReversed,
  getScreenTransform,
} from './transformSelectors';

export * from './indexPathSelectors';
export * from './pageSelectors';
export * from './themeSelectors';
export * from './transformSelectors';

export const getCurrentTab = (state: ApplicationState): WorkspaceTab => {
  return state.currentTab;
};

export const getCurrentComponentsTab = (state: ApplicationState): ThemeTab => {
  return state.currentThemeTab;
};

export const getSelectedLayersExcludingDescendants = (
  state: ApplicationState,
): Sketch.AnyLayer[] => {
  const pageIndex = getCurrentPageIndex(state);

  return getSelectedLayerIndexPathsExcludingDescendants(state).map(
    (layerIndex) => {
      return Layers.access(state.sketch.pages[pageIndex], layerIndex);
    },
  );
};

export const getSelectedStyles = (state: ApplicationState): Sketch.Style[] => {
  const currentTab = getCurrentTab(state);
  const currentComponentsTab = getCurrentComponentsTab(state);

  return currentTab === 'canvas'
    ? getSelectedLayers(state).flatMap((layer) =>
        layer.style ? [layer.style] : [],
      )
    : currentComponentsTab === 'layerStyles'
    ? getSelectedLayerStyles(state).map((style) => style.value)
    : getSelectedThemeTextStyles(state).map((style) => style.value);
};

export const getSelectedTextLayers = (
  state: ApplicationState,
): Sketch.Text[] => {
  return getSelectedLayers(state).filter(
    (layer): layer is Sketch.Text => layer._class === 'text',
  );
};

export const getSelectedLayers = (state: ApplicationState): PageLayer[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[];
};

export const getSelectedRect = (state: ApplicationState): Rect => {
  const page = getCurrentPage(state);
  const layerIndexPaths = getSelectedLayerIndexPaths(state);
  const layerIds = layerIndexPaths.map(
    (indexPath) => Layers.access(page, indexPath).do_objectID,
  );
  return getBoundingRect(page, AffineTransform.identity, layerIds)!;
};

export const getSelectedLayersWithContextSettings = (
  state: ApplicationState,
): PageLayer[] => {
  const page = getCurrentPage(state);

  return (Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[]).filter(
    (layer) => layer._class !== 'artboard' && layer.style?.contextSettings,
  );
};

export const getSelectedLayersWithFixedRadius = (
  state: ApplicationState,
): Sketch.Rectangle[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ).filter((layer): layer is Sketch.Rectangle => layer._class === 'rectangle');
};

export const makeGetPageLayers = (
  state: ApplicationState,
): ((ids: UUID[]) => PageLayer[]) => {
  const page = getCurrentPage(state);

  return (ids: UUID[]) =>
    ids
      .map((id) => page.layers.find((layer) => layer.do_objectID === id))
      .filter((layer): layer is PageLayer => !!layer);
};

export function getScaleDirectionAtPoint(
  state: ApplicationState,
  point: Point,
): CompassDirection | undefined {
  const page = getCurrentPage(state);
  const boundingRect = getBoundingRect(
    page,
    AffineTransform.identity,
    state.selectedObjects,
  );

  if (!boundingRect) return;

  const handles = getDragHandles(boundingRect);

  const handle = handles.find((handle) =>
    rectContainsPoint(handle.rect, point),
  );

  return handle?.compassDirection;
}

export type LayerTraversalOptions = {
  includeHiddenLayers: boolean;
  clickThroughGroups: boolean;
};

function shouldClickThrough(
  layer: Sketch.AnyLayer,
  options: LayerTraversalOptions,
) {
  return (
    layer._class === 'artboard' ||
    (layer._class === 'group' &&
      (layer.hasClickThrough || options.clickThroughGroups))
  );
}

function visitLayersReversed(
  rootLayer: Sketch.AnyLayer,
  ctm: AffineTransform,
  options: LayerTraversalOptions,
  onEnter: (layer: Sketch.AnyLayer, ctm: AffineTransform) => EnterReturnValue,
) {
  visitReversed(rootLayer, {
    onEnter: (layer, indexPath) => {
      if (layer._class === 'page') return;

      if (!layer.isVisible && !options.includeHiddenLayers) return SKIP;

      const transform = getLayerTransformAtIndexPathReversed(
        rootLayer,
        indexPath,
        ctm,
      );

      const result = onEnter(layer, transform);

      if (result === STOP) return result;

      if (!shouldClickThrough(layer, options)) return SKIP;

      return result;
    },
  });
}

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  insets: CanvasInsets,
  point: Point,
  traversalOptions?: LayerTraversalOptions,
): PageLayer | undefined {
  const page = getCurrentPage(state);
  const canvasTransform = getCanvasTransform(state, insets);
  const screenTransform = getScreenTransform(insets);

  const options = traversalOptions ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  // TODO: check if we're clicking the title of an artboard

  let found: Sketch.AnyLayer | undefined;

  const screenPoint = screenTransform.applyTo(point);

  visitLayersReversed(page, canvasTransform, options, (layer, ctm) => {
    const transform = AffineTransform.multiply(
      ctm,
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    const localPoints = framePoints.map((point) => transform.applyTo(point));

    const containsPoint = rotatedRectContainsPoint(localPoints, screenPoint);

    if (!containsPoint) return SKIP;

    // Artboards can't be selected themselves, and instead only update the ctm
    if (shouldClickThrough(layer, options)) return;

    switch (layer._class) {
      case 'rectangle':
      case 'oval': {
        const pathPoint = transform.invert().applyTo(screenPoint);

        const path = Primitives.path(
          CanvasKit,
          layer.points,
          layer.frame,
          Layers.getFixedRadius(layer),
        );

        if (!path.contains(pathPoint.x, pathPoint.y)) return;

        break;
      }
      default:
        break;
    }

    found = layer;

    return STOP;
  });

  return found as PageLayer;
}

export function getBoundingRect(
  rootLayer: Sketch.AnyLayer,
  ctm: AffineTransform,
  layerIds: string[],
  options?: LayerTraversalOptions,
): Rect | undefined {
  options = options ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  let bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  visitLayersReversed(rootLayer, ctm, options, (layer, ctm) => {
    if (!layerIds.includes(layer.do_objectID)) return;

    const transform = AffineTransform.multiply(
      ctm,
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    const localPoints = framePoints.map((point) => transform.applyTo(point));

    const xs = localPoints.map((point) => point.x);
    const ys = localPoints.map((point) => point.y);

    bounds.minX = Math.min(bounds.minX, ...xs);
    bounds.minY = Math.min(bounds.minY, ...ys);
    bounds.maxX = Math.max(bounds.maxX, ...xs);
    bounds.maxY = Math.max(bounds.maxY, ...ys);
  });

  // Check that at least one layer had a non-zero size
  if (!Object.values(bounds).every(isFinite)) return undefined;

  return createRectFromBounds(bounds);
}

export function getBoundingPoints(
  rootLayer: Sketch.AnyLayer,
  ctm: AffineTransform,
  layerId: string,
  options?: LayerTraversalOptions,
): Point[] {
  options = options ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  let points: Point[] = [];

  visitLayersReversed(rootLayer, ctm, options, (layer, ctm) => {
    if (layerId !== layer.do_objectID) return;

    const transform = AffineTransform.multiply(
      ctm,
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    points = framePoints.map((point) => transform.applyTo(point));

    return STOP;
  });

  return points;
}

export function getLayersInRect(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  insets: CanvasInsets,
  rect: Rect,
  traversalOptions?: LayerTraversalOptions,
): PageLayer[] {
  const options = traversalOptions ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  const page = getCurrentPage(state);

  let found: Sketch.AnyLayer[] = [];

  const screenTransform = getScreenTransform(insets);
  const screenRect = transformRect(rect, screenTransform);

  visitLayersReversed(
    page,
    getCanvasTransform(state, insets),
    options,
    (layer, ctm) => {
      // TODO: Handle rotated rectangle collision
      const hasIntersect = rectsIntersect(
        transformRect(layer.frame, ctm),
        screenRect,
      );

      if (!hasIntersect) return SKIP;

      // Artboards can't be selected themselves
      if (shouldClickThrough(layer, options)) return;

      found.push(layer);
    },
  );

  return found as PageLayer[];
}

export function visitStyleColors(
  style: Sketch.Style,
  f: (color: Sketch.Color) => void,
): void {
  if (style?.textStyle?.encodedAttributes.MSAttributedStringColorAttribute) {
    f(style?.textStyle?.encodedAttributes.MSAttributedStringColorAttribute);
  }
  style?.fills?.forEach((fill) => f(fill.color));
  style?.borders?.forEach((border) => f(border.color));
  style?.shadows?.forEach((shadow) => f(shadow.color));
  style?.innerShadows.forEach((fill) => f(fill.color));
}

export function visitLayerColors(
  layer: Sketch.AnyLayer,
  f: (color: Sketch.Color) => void,
) {
  if (layer.style) visitStyleColors(layer.style, f);

  if (layer._class === 'text') {
    const attributes = layer.attributedString.attributes;
    if (attributes) {
      attributes.forEach((a) => {
        if (a.attributes.MSAttributedStringColorAttribute)
          f(a.attributes.MSAttributedStringColorAttribute);
      });
    }
  }
}
