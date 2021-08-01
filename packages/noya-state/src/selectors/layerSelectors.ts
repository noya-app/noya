import type Sketch from '@sketch-hq/sketch-file-format-ts';
import produce, { Draft } from 'immer';
import { RelativeDropPosition } from 'noya-designsystem';
import {
  AffineTransform,
  createBounds,
  createRectFromBounds,
  getRectCornerPoints,
  Point,
  rectContainsPoint,
  rectsIntersect,
  transformRect,
} from 'noya-geometry';
import { IndexPath } from 'tree-visit';
import {
  ApplicationState,
  isLine,
  isPointsLayer,
  Layers,
  PageLayer,
  Selectors,
} from '../index';
import type { UUID } from '../types';
import {
  getLayerIndexPathsExcludingDescendants,
  getSelectedLayerIndexPathsExcludingDescendants,
} from './indexPathSelectors';
import { getCurrentPage, getCurrentPageIndex } from './pageSelectors';
import { getLayerTransformAtIndexPath } from './transformSelectors';

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
  return getSelectedLayers(state).filter(
    (layer): layer is Sketch.Text => layer._class === 'text',
  );
};

export const getSelectedLayers = (
  state: Draft<ApplicationState>,
): PageLayer[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[];
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
  T extends Exclude<Sketch.AnyLayer, { _class: 'page' }>
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
  const layer = page.layers.sort((a, b) => {
    const aBounds = createBounds(a.frame);
    const bBounds = createBounds(b.frame);

    return bBounds.maxX - aBounds.maxX;
  })[0];

  return createBounds(layer.frame);
};

export function findSymbolMaster<T extends Sketch.SymbolMaster | undefined>(
  state: ApplicationState,
  symbolID: string,
): T {
  return Layers.findInArray(
    state.sketch.pages,
    (child) => Layers.isSymbolMaster(child) && symbolID === child.symbolID,
  ) as T;
}

export function addToParentLayer(
  layers: Sketch.AnyLayer[],
  layer: Sketch.AnyLayer,
) {
  const parent = layers
    .filter(
      (layer): layer is Sketch.Artboard | Sketch.SymbolMaster =>
        Layers.isArtboard(layer) || Layers.isSymbolMaster(layer),
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
  const page = Selectors.getCurrentPage(state);
  const indexPath = Layers.findIndexPath(
    page,
    (layer) => layer.do_objectID === state.selectedObjects[0],
  );
  if (!indexPath) return undefined;

  const layer = Layers.access(page, indexPath);

  if (!isPointsLayer(layer)) return undefined;

  return isLine(layer.points) ? layer : undefined;
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
  rawPosition: RelativeDropPosition,
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
      case 'inside': {
        parentIndexPath = destinationIndexPath;
        parent = Layers.access(
          draftPage,
          parentIndexPath,
        ) as Layers.ParentLayer;

        destinationIndex = parent.layers.length;
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

    if (Layers.isGroup(parent)) {
      fixGroupFrame(parent);
    }
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
    draft.selectedObjects = ids;
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
