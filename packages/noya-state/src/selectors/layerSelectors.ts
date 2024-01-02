import type { Sketch } from '@noya-app/noya-file-format';
import {
  AffineTransform,
  createBounds,
  createRectFromBounds,
  getRectCornerPoints,
  normalizeRect,
  Point,
  Rect,
  rectContainsPoint,
  rectsIntersect,
  transformRect,
} from '@noya-app/noya-geometry';
import produce, { Draft } from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { RelativeDropPosition } from 'noya-designsystem';
import { CSSProperties } from 'react';
import { IndexPath } from 'tree-visit';
import { Layers } from '../layer';
import { PageLayer } from '../layers';
import type { ApplicationState } from '../reducers/applicationReducer';
import { CompassDirection } from '../reducers/interactionReducer';
import type { UUID } from '../types';
import { getMultiValue } from '../utils/getMultiValue';
import {
  getLayerIndexPathsExcludingDescendants,
  getSelectedLayerIndexPathsExcludingDescendants,
} from './indexPathSelectors';
import { getCurrentPage, getCurrentPageIndex } from './pageSelectors';
import { isLine } from './pointSelectors';
import { getTextSelection } from './textSelectors';
import { getLayerTransformAtIndexPath } from './transformSelectors';

/*
 * Get an array of all layers using as few lookups as possible on the state tree.
 *
 * Immer will duplicate any objects we access within a produce method, so we
 * don't want to walk every layer, since that would duplicate all of them.
 */
export function accessPageLayers(
  state: WritableDraft<ApplicationState>,
  pageIndex: number,
  layerIndexPaths: IndexPath[],
): Sketch.AnyLayer[] {
  return layerIndexPaths.map((layerIndex) => {
    return Layers.access(state.sketch.pages[pageIndex], layerIndex);
  });
}

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

export const getSelectedTextLayers = (
  state: ApplicationState,
): Sketch.Text[] => {
  const selectedText = getTextSelection(state);

  if (selectedText) {
    const layer = Layers.find(
      getCurrentPage(state),
      (layer) => layer.do_objectID === selectedText.layerId,
    );

    return layer && Layers.isTextLayer(layer) ? [layer] : [];
  }

  return getSelectedLayers(state).filter(Layers.isTextLayer);
};

export const getSelectedLayers = (
  state: Draft<ApplicationState>,
): PageLayer[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedLayerIds.includes(layer.do_objectID),
  ) as PageLayer[];
};

export const getSelectedLayersWithContextSettings = (
  state: ApplicationState,
): PageLayer[] => {
  const page = getCurrentPage(state);

  return (
    Layers.findAll(page, (layer) =>
      state.selectedLayerIds.includes(layer.do_objectID),
    ) as PageLayer[]
  ).filter(
    (layer) => layer._class !== 'artboard' && layer.style?.contextSettings,
  );
};

export const getSelectedLayersWithFixedRadius = (
  state: ApplicationState,
): Sketch.Rectangle[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedLayerIds.includes(layer.do_objectID),
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

export const deleteLayers = (layers: IndexPath[], page: Sketch.Page) => {
  // We delete in reverse so that the indexPaths remain accurate even
  // after some layers are deleted.
  const reversed = [...layers].reverse();

  reversed.forEach((indexPath) => {
    const childIndex = indexPath[indexPath.length - 1];
    const parent = Layers.access(
      page,
      indexPath.slice(0, -1),
    ) as Layers.ParentLayer;
    parent.layers.splice(childIndex, 1);
  });
};

export const getParentLayer = (page: Sketch.AnyLayer, indexPath: IndexPath) =>
  Layers.access(page, indexPath.slice(0, -1)) as Layers.ParentLayer;

export const addSiblingLayer = <
  T extends Exclude<Sketch.AnyLayer, { _class: 'page' }>,
>(
  page: Sketch.AnyLayer,
  indexPath: IndexPath,
  layer: T | T[],
) => {
  const parent = getParentLayer(page, indexPath);
  const layers = layer instanceof Array ? layer : [layer];
  parent.layers.splice(indexPath[indexPath.length - 1], 0, ...layers);
};

export const getRightMostLayerBounds = (page: Sketch.Page) => {
  const layer = [...page.layers].sort((a, b) => {
    const aBounds = createBounds(a.frame);
    const bBounds = createBounds(b.frame);

    return bBounds.maxX - aBounds.maxX;
  })[0];

  return createBounds(layer.frame);
};

export function addToParentLayer(
  layers: Sketch.AnyLayer[],
  layer: Sketch.AnyLayer,
) {
  const parent = layers
    .filter(
      (layer): layer is Sketch.Artboard | Sketch.SymbolMaster | Sketch.Group =>
        Layers.isArtboard(layer) ||
        Layers.isSymbolMaster(layer) ||
        Layers.isGroup(layer),
    )
    .find((artboard) => rectsIntersect(artboard.frame, layer.frame));

  if (parent && Layers.isChildLayer(layer)) {
    layer.frame.x -= parent.frame.x;
    layer.frame.y -= parent.frame.y;

    parent.layers.push(layer);
  } else {
    layers.push(layer);
  }
}

export function getSelectedLineLayer(
  state: ApplicationState,
): Layers.PointsLayer | undefined {
  if (state.selectedLayerIds.length !== 1) return;

  const page = getCurrentPage(state);

  const layer = Layers.find(
    page,
    (layer) => layer.do_objectID === state.selectedLayerIds[0],
  );

  if (!layer || !Layers.isPointsLayer(layer) || !isLine(layer.points)) return;

  return layer;
}

export function getCursorForCompassDirection(
  direction: CompassDirection,
): CSSProperties['cursor'] {
  switch (direction) {
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
  }
}

export function getCursorForDirection(
  direction: CompassDirection,
  state: ApplicationState,
): CSSProperties['cursor'] {
  if (getSelectedLineLayer(state)) return 'move';

  return getCursorForCompassDirection(direction);
}

export function getParentLayerAtPoint(page: Sketch.Page, point: Point) {
  return page.layers
    .filter(
      (layer): layer is Sketch.Artboard | Sketch.SymbolMaster =>
        Layers.isArtboard(layer) || Layers.isSymbolMaster(layer),
    )
    .find((artboard) => rectContainsPoint(artboard.frame, point));
}

export function moveLayer(
  state: ApplicationState,
  id: string | string[],
  destinationId: string,
  rawPosition: RelativeDropPosition | 'inside-end',
) {
  const position =
    rawPosition === 'above'
      ? 'below'
      : rawPosition === 'below'
      ? 'above'
      : rawPosition;

  const ids = typeof id === 'string' ? [id] : id;

  const indexPaths = getLayerIndexPathsExcludingDescendants(state, ids);
  const pageIndex = getCurrentPageIndex(state);

  return produce(state, (draft) => {
    const draftPage = draft.sketch.pages[pageIndex];

    const layerInfo = indexPaths.map((indexPath) => ({
      layer: Layers.access(draftPage, indexPath) as Layers.ChildLayer,
      transform: getLayerTransformAtIndexPath(draftPage, indexPath),
    }));

    deleteLayers(indexPaths, draftPage);

    const destinationIndexPath = Layers.findIndexPath(
      draftPage,
      (layer) => layer.do_objectID === destinationId,
    );

    if (!destinationIndexPath) return;

    let parentIndexPath: IndexPath;
    let parent: Layers.ParentLayer;
    let destinationIndex: number;

    switch (position) {
      case 'inside':
      case 'inside-end': {
        parentIndexPath = destinationIndexPath;
        parent = Layers.access(
          draftPage,
          parentIndexPath,
        ) as Layers.ParentLayer;

        destinationIndex = position === 'inside-end' ? 0 : parent.layers.length;
        break;
      }
      case 'above':
      case 'below': {
        parentIndexPath = destinationIndexPath.slice(0, -1);
        parent = Layers.access(
          draftPage,
          parentIndexPath,
        ) as Layers.ParentLayer;

        const siblingIndex =
          destinationIndexPath[destinationIndexPath.length - 1];

        destinationIndex =
          position === 'above' ? siblingIndex : siblingIndex + 1;
        break;
      }
    }

    layerInfo.forEach(({ layer, transform }, i) => {
      const parentTransform = getLayerTransformAtIndexPath(
        draftPage,
        parentIndexPath,
        undefined,
        'includeLast',
      );

      // First we undo the original parent's transform, then we apply the new parent's transform
      const newTransform = AffineTransform.multiply(
        transform,
        parentTransform.invert(),
      );

      const newLayer = produce(layer, (draftLayer) => {
        draftLayer.frame = {
          ...draftLayer.frame,
          ...transformRect(draftLayer.frame, newTransform),
        };
      });

      parent.layers.splice(destinationIndex + i, 0, newLayer);
    });

    indexPaths.forEach((indexPath) => {
      fixGroupFrameHierarchy(draftPage, indexPath.slice(0, -1));
    });

    fixGroupFrameHierarchy(draftPage, parentIndexPath);
  });
}

/**
 * Normalize a group's frame so that it equals exactly the bounding rect of all of its
 * children, and the top-left-most child begins at {0, 0}
 */
export function fixGroupFrame(group: Sketch.Group) {
  const points = group.layers.flatMap((layer) =>
    getRectCornerPoints(layer.frame),
  );

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  const bounds = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };

  const newGroupFrame = createRectFromBounds(bounds);

  group.frame = {
    ...group.frame,
    x: group.frame.x + newGroupFrame.x,
    y: group.frame.y + newGroupFrame.y,
    width: newGroupFrame.width,
    height: newGroupFrame.height,
  };

  group.layers.forEach((layer) => {
    layer.frame.x -= bounds.minX;
    layer.frame.y -= bounds.minY;
  });
}

export function fixGroupFrameHierarchy(
  page: Sketch.Page,
  indexPath: IndexPath,
) {
  const layerPath = Layers.accessPath(page, indexPath).reverse();

  for (let layer of layerPath) {
    if (Layers.isGroup(layer)) {
      fixGroupFrame(layer);
    } else {
      break;
    }
  }
}

export function insertLayerAtIndexPath(
  state: ApplicationState,
  layer: PageLayer | PageLayer[],
  destinationIndexPath: IndexPath,
  rawPosition: RelativeDropPosition,
) {
  const layers = Array.isArray(layer) ? layer : [layer];
  const ids = layers.map((layer) => layer.do_objectID);

  const pageIndex = getCurrentPageIndex(state);

  // Add the layers to the page. Since they're added last, this won't invalidate
  // the `destinationIndexPath`
  state = produce(state, (draft) => {
    draft.sketch.pages[pageIndex].layers.push(...layers);
    draft.selectedLayerIds = ids;
  });

  // Move the layers into their target position
  return moveLayer(
    state,
    ids,
    Layers.access(getCurrentPage(state), destinationIndexPath).do_objectID,
    rawPosition,
  );
}

export function insertLayer(
  state: ApplicationState,
  layer: PageLayer | PageLayer[],
  destinationId: string,
  rawPosition: RelativeDropPosition,
) {
  const destinationIndexPath = Layers.findIndexPath(
    getCurrentPage(state),
    (layer) => layer.do_objectID === destinationId,
  );

  if (!destinationIndexPath) return state;

  return insertLayerAtIndexPath(
    state,
    layer,
    destinationIndexPath,
    rawPosition,
  );
}

export function removeLayerAtIndexPath(
  state: ApplicationState,
  indexPaths: IndexPath[],
) {
  const pageIndex = getCurrentPageIndex(state);

  return produce(state, (draft) => {
    // We delete in reverse so that the indexPaths remain accurate even
    // after some layers are deleted.
    const reversed = [...indexPaths].reverse();

    reversed.forEach((indexPath) => {
      const childIndex = indexPath[indexPath.length - 1];

      const parent = Layers.access(
        draft.sketch.pages[pageIndex],
        indexPath.slice(0, -1),
      ) as Layers.ParentLayer;

      parent.layers.splice(childIndex, 1);
    });
  });
}

export function removeLayer(state: ApplicationState, id: string | string[]) {
  const ids = new Set(typeof id === 'string' ? [id] : id);

  const indexPaths = Layers.findAllIndexPaths(getCurrentPage(state), (layer) =>
    ids.has(layer.do_objectID),
  );

  if (!indexPaths) return state;

  return removeLayerAtIndexPath(state, indexPaths);
}

export function resizeLayerFrame<T extends Sketch.AnyLayer>(
  layer: T,
  rect: Rect,
  options?: {
    resizeArtboardBehavior: 'translate' | 'scale';
  },
): T {
  const originalFrame = layer.frame;
  const newFrame = normalizeRect(rect);

  return produce(layer, (draft) => {
    draft.frame = {
      ...draft.frame,
      ...newFrame,
    };

    // When a group is resized, we scale its children
    if (
      Layers.isGroup(draft) ||
      (Layers.isSymbolMasterOrArtboard(draft) &&
        options?.resizeArtboardBehavior === 'scale')
    ) {
      const scaleTransform = AffineTransform.scale(
        newFrame.width / originalFrame.width,
        newFrame.height / originalFrame.height,
      );

      draft.layers = draft.layers.map((childLayer) =>
        resizeLayerFrame(
          childLayer,
          transformRect(childLayer.frame, scaleTransform),
        ),
      );
    }

    // When an artboard is resized, we preserve the visual translation of its children
    if (
      Layers.isSymbolMasterOrArtboard(draft) &&
      options?.resizeArtboardBehavior !== 'scale'
    ) {
      const translationTransform = AffineTransform.translate(
        originalFrame.x - newFrame.x,
        originalFrame.y - newFrame.y,
      );

      draft.layers = draft.layers.map((childLayer) =>
        resizeLayerFrame(
          childLayer,
          transformRect(childLayer.frame, translationTransform),
        ),
      );
    }
  });
}

// If the shift key is held, or if any layer has `constrainProportions`,
// we do constrained scaling
export function getConstrainedScaling(
  state: ApplicationState,
  page: Sketch.Page,
  indexPaths: IndexPath[],
) {
  return (
    state.keyModifiers.shiftKey === true ||
    (getMultiValue(
      indexPaths.map(
        (indexPath) =>
          Layers.access(page, indexPath).frame.constrainProportions,
      ),
    ) ??
      true)
  );
}

/**
 * Returns the children blocks of the current artboard, excluding the selected blocks.
 */
export function getSiblingBlocks(state: ApplicationState) {
  const artboard = Layers.find(
    getCurrentPage(state),
    (layer) => layer.do_objectID === state.isolatedLayerId,
  );

  if (!artboard || !Layers.isArtboard(artboard)) return [];

  return artboard.layers
    .filter(Layers.isSymbolInstance)
    .filter((layer) => !state.selectedLayerIds.includes(layer.do_objectID))
    .map((layer) => ({
      id: layer.do_objectID,
      symbolId: layer.symbolID,
      blockText: layer.blockText,
      frame: layer.frame,
    }));
}
