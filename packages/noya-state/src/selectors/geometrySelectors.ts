import { Sketch } from '@noya-app/noya-file-format';
import {
  AffineTransform,
  createRect,
  createRectFromBounds,
  getRectCornerPoints,
  Insets,
  Point,
  Rect,
  rectContainsPoint,
  rectContainsRect,
  rectsIntersect,
  rotatedRectContainsPoint,
  Size,
  transformRect,
} from '@noya-app/noya-geometry';
import type { CanvasKit } from '@noya-app/noya-canvaskit';
import { IFontManager } from 'noya-renderer';
import * as Primitives from 'noya-state';
import { ScalingOptions } from 'noya-state';
import { SKIP, STOP, VisitOptions } from 'tree-visit';
import { Layers } from '../layer';
import { PageLayer, visitReversed } from '../layers';
import type { ApplicationState } from '../reducers/applicationReducer';
import { CompassDirection } from '../reducers/interactionReducer';
import { getDragHandles } from '../selection';
import { getSelectedLayerIndexPaths } from './indexPathSelectors';
import {
  getCurrentPage,
  getCurrentPageMetadata,
  getCurrentPageZoom,
} from './pageSelectors';
import {
  getArtboardLabelParagraphSize,
  getArtboardLabelRect,
  getArtboardLabelTransform,
} from './textSelectors';
import {
  getCanvasTransform,
  getLayerFlipTransform,
  getLayerRotationTransform,
  getLayerTransformAtIndexPathReversed,
  getScreenTransform,
} from './transformSelectors';

export type LayerTraversalOptions = {
  /**
   * The default is false
   */
  includeHiddenLayers?: boolean;

  /**
   * The default is true
   */
  includeLockedLayers?: boolean;

  /**
   * The default is true
   */
  includePartiallyContainedLayers?: boolean;

  /**
   * The default is false
   */
  includeLayersOutsideArtboardBounds?: boolean;

  /**
   * The default is `groupOnly`
   */
  groups?: 'groupOnly' | 'childrenOnly' | 'groupAndChildren';

  /**
   * The default is `childrenOnly`
   *
   * We use `emptyOrContainedArtboardOrChildren` when we're working with user interactions.
   * This will select empty artboards, artboards fully contained by the user's marquee, or
   * artboards where the label contains the mouse.
   */
  artboards?:
    | 'artboardOnly'
    | 'childrenOnly'
    | 'artboardAndChildren'
    | 'emptyOrContainedArtboardOrChildren';
};

const DEFAULT_TRAVERSAL_OPTIONS: Required<LayerTraversalOptions> = {
  includeHiddenLayers: false,
  includeLockedLayers: true,
  includePartiallyContainedLayers: true,
  includeLayersOutsideArtboardBounds: false,
  groups: 'groupOnly',
  artboards: 'childrenOnly',
};

function shouldVisitChildren(
  layer: Sketch.AnyLayer,
  traversalOptions: LayerTraversalOptions,
) {
  const options: Required<LayerTraversalOptions> = {
    ...DEFAULT_TRAVERSAL_OPTIONS,
    ...traversalOptions,
  };

  switch (layer._class) {
    case 'symbolMaster':
    case 'artboard':
      return options.artboards !== 'artboardOnly';
    case 'group':
      return options.groups !== 'groupOnly' || layer.hasClickThrough;
    case 'slice':
      return options.groups !== 'groupOnly';
    default:
      return false;
  }
}

function shouldVisitLayer(
  layer: Sketch.AnyLayer,
  traversalOptions: LayerTraversalOptions,
) {
  const options: Required<LayerTraversalOptions> = {
    ...DEFAULT_TRAVERSAL_OPTIONS,
    ...traversalOptions,
  };

  return (
    (layer.isVisible || options.includeHiddenLayers) &&
    (!layer.isLocked || options.includeLockedLayers)
  );
}

function visitLayersReversed(
  rootLayer: Sketch.AnyLayer,
  options: LayerTraversalOptions,
  onEnter: NonNullable<VisitOptions<Sketch.AnyLayer>['onEnter']>,
) {
  visitReversed(rootLayer, {
    onEnter: (layer, indexPath) => {
      if (Layers.isPageLayer(layer)) return;

      if (!shouldVisitLayer(layer, options)) return SKIP;

      const result = onEnter(layer, indexPath);

      if (result === STOP) return result;

      if (!shouldVisitChildren(layer, options)) return SKIP;

      return result;
    },
  });
}

export function getLayersInRect(
  state: ApplicationState,
  page: Sketch.Page,
  insets: Insets,
  rect: Rect,
  options: LayerTraversalOptions = {},
): PageLayer[] {
  let found: Sketch.AnyLayer[] = [];

  const screenTransform = getScreenTransform(insets);
  const screenRect = transformRect(rect, screenTransform);

  const canvasTransform = getCanvasTransform(state, insets);

  visitLayersReversed(page, options, (layer, indexPath) => {
    const transform = getLayerTransformAtIndexPathReversed(
      page,
      indexPath,
      canvasTransform,
    );
    const transformedFrame = transformRect(layer.frame, transform);

    // TODO: Handle rotated rectangle collision
    const hasIntersect = rectsIntersect(screenRect, transformedFrame);

    const visitChildrenEvenWhenNotIntersecting =
      Layers.isArtboard(layer) && options.includeLayersOutsideArtboardBounds;

    if (!hasIntersect && !visitChildrenEvenWhenNotIntersecting) {
      return SKIP;
    }

    const includeSelf =
      (Layers.isGroup(layer) && options.groups === 'groupAndChildren') ||
      (Layers.isSymbolMasterOrArtboard(layer) &&
        (options.artboards === 'artboardAndChildren' ||
          (options.artboards === 'emptyOrContainedArtboardOrChildren' &&
            (layer.layers.length === 0 ||
              rectContainsRect(screenRect, transformedFrame)))));

    // Traverse into children and return some of them, instead of returning this layer
    if (!includeSelf && shouldVisitChildren(layer, options)) return;

    if (
      options.includePartiallyContainedLayers === false &&
      !rectContainsRect(screenRect, transformedFrame)
    ) {
      return;
    }

    found.push(layer);
  });

  return found as PageLayer[];
}

export function artboardLabelContainsPoint(
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  layer: Sketch.Artboard | Sketch.SymbolMaster,
  canvasTransform: AffineTransform,
  screenPoint: Point,
  zoom: number,
): boolean {
  const paragraphSize = getArtboardLabelParagraphSize(
    CanvasKit,
    fontManager,
    layer.name,
  );

  const rect = getArtboardLabelRect(layer.frame, paragraphSize);

  const zoomRect = transformRect(rect, getArtboardLabelTransform(rect, zoom));

  const labelRect = transformRect(zoomRect, canvasTransform);

  return rectContainsPoint(labelRect, screenPoint);
}

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  state: ApplicationState,
  insets: Insets,
  point: Point,
  options: LayerTraversalOptions = {},
): PageLayer | undefined {
  const page = getCurrentPage(state);
  const { zoomValue } = getCurrentPageMetadata(state);
  const canvasTransform = getCanvasTransform(state, insets);
  const screenTransform = getScreenTransform(insets);

  let found: Sketch.AnyLayer | undefined;

  const screenPoint = screenTransform.applyTo(point);

  visitLayersReversed(page, options, (layer, indexPath) => {
    const transform = AffineTransform.multiply(
      getLayerTransformAtIndexPathReversed(page, indexPath, canvasTransform),
      getLayerFlipTransform(layer),
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    const localPoints = framePoints.map((point) => transform.applyTo(point));

    const frameContainsPoint = rotatedRectContainsPoint(
      localPoints as [Point, Point, Point, Point],
      screenPoint,
    );

    const visitChildrenEvenWhenNotIntersecting =
      Layers.isArtboard(layer) && options.includeLayersOutsideArtboardBounds;

    if (!frameContainsPoint && !visitChildrenEvenWhenNotIntersecting) {
      if (
        Layers.isSymbolMasterOrArtboard(layer) &&
        options.artboards === 'emptyOrContainedArtboardOrChildren' &&
        artboardLabelContainsPoint(
          CanvasKit,
          fontManager,
          layer,
          canvasTransform,
          screenPoint,
          zoomValue,
        )
      ) {
        found = layer;

        return STOP;
      }

      return SKIP;
    }

    const includeArtboard =
      Layers.isSymbolMasterOrArtboard(layer) &&
      (options.artboards === 'artboardAndChildren' ||
        (options.artboards === 'emptyOrContainedArtboardOrChildren' &&
          layer.layers.length === 0));

    // Traverse into children and return one of them, instead of returning this layer
    if (!includeArtboard && shouldVisitChildren(layer, options)) return;

    switch (layer._class) {
      case 'rectangle':
      case 'oval': {
        const pathPoint = transform.invert().applyTo(screenPoint);

        const path = Primitives.path(
          CanvasKit,
          layer.points,
          layer.frame,
          layer.isClosed,
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

/**
 * Returns an axis-aligned Rect that contains all layers passed via `layerIds`,
 * or undefined if no layers were passed.
 */
export function getBoundingRect(
  rootLayer: Sketch.AnyLayer,
  layerIds: string[],
  options: LayerTraversalOptions = {},
): Rect | undefined {
  let bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  visitLayersReversed(rootLayer, options, (layer, indexPath) => {
    if (!layerIds.includes(layer.do_objectID)) return;

    const transform = AffineTransform.multiply(
      getLayerTransformAtIndexPathReversed(rootLayer, indexPath),
      getLayerFlipTransform(layer),
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
  layerId: string,
  options: LayerTraversalOptions = {},
): Point[] {
  let points: Point[] = [];

  visitLayersReversed(rootLayer, options, (layer, indexPath) => {
    if (layerId !== layer.do_objectID) return;

    const transform = AffineTransform.multiply(
      getLayerTransformAtIndexPathReversed(rootLayer, indexPath),
      getLayerFlipTransform(layer),
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    points = framePoints.map((point) => transform.applyTo(point));

    return STOP;
  });

  return points;
}

export function getScaleDirectionAtPoint(
  state: ApplicationState,
  point: Point,
): CompassDirection | undefined {
  const page = getCurrentPage(state);
  const boundingRect = getBoundingRect(page, state.selectedLayerIds);

  if (!boundingRect) return;

  const handles = getDragHandles(
    state,
    boundingRect,
    getCurrentPageZoom(state),
  );

  const handle = handles.find((handle) =>
    rectContainsPoint(handle.rect, point),
  );

  return handle?.compassDirection;
}

export const getSelectedRect = (state: ApplicationState): Rect => {
  const page = getCurrentPage(state);
  const layerIndexPaths = getSelectedLayerIndexPaths(state);
  const layerIds = layerIndexPaths.map(
    (indexPath) => Layers.access(page, indexPath).do_objectID,
  );
  return getBoundingRect(page, layerIds)!;
};

export function getBoundingRectMap(
  rootLayer: Sketch.AnyLayer,
  layerIds: string[],
  options: LayerTraversalOptions,
) {
  const rectMap: Record<string, Rect> = {};

  layerIds.forEach((layerId) => {
    if (layerId in rectMap) return;

    const rect = getBoundingRect(rootLayer, [layerId], options);

    if (!rect) return;

    rectMap[layerId] = rect;
  });

  return rectMap;
}

export function getPageContentBoundingRect(page: Sketch.Page) {
  return getBoundingRect(
    page,
    Layers.findAll(page, () => true).map((l) => l.do_objectID),
  );
}

export function getClippedLayerMap(
  state: ApplicationState,
  canvasSize: Size,
  canvasInsets: Insets,
) {
  const page = getCurrentPage(state);

  const allLayerIds = Layers.findAll(
    page,
    (layer) => !Layers.isPageLayer(layer),
  ).map((layer) => layer.do_objectID);

  const visibleRect = {
    x: -canvasInsets.left,
    y: -canvasInsets.top,
    width: canvasSize.width + canvasInsets.left + canvasInsets.right,
    height: canvasSize.height + canvasInsets.top + canvasInsets.bottom,
  };

  const visibleLayerSet = getLayersInRect(
    state,
    page,
    canvasInsets,
    visibleRect,
    {
      groups: 'groupAndChildren',
      artboards: 'artboardAndChildren',
    },
  ).map((layer) => layer.do_objectID);

  const result: Record<string, boolean> = {};

  allLayerIds.forEach((id) => {
    result[id] = true;
  });

  visibleLayerSet.forEach((id) => {
    result[id] = false;
  });

  return result;
}

export function getDrawnLayerRect(
  origin: Point,
  current: Point,
  { scalingOriginMode, constrainProportions }: ScalingOptions = {
    scalingOriginMode: 'extent',
    constrainProportions: false,
  },
): Rect {
  if (constrainProportions) {
    const delta = {
      x: current.x - origin.x,
      y: current.y - origin.y,
    };

    const max = Math.max(Math.abs(delta.x), Math.abs(delta.y));

    current = {
      x: origin.x + (delta.x < 0 ? -max : max),
      y: origin.y + (delta.y < 0 ? -max : max),
    };
  }

  if (scalingOriginMode === 'center') {
    const delta = {
      x: current.x - origin.x,
      y: current.y - origin.y,
    };

    origin = {
      x: origin.x - delta.x,
      y: origin.y - delta.y,
    };
  }

  return createRect(origin, current);
}
