import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  BaseOptions,
  IndexPath,
  SKIP,
  STOP,
  visit as visitNode,
  withOptions,
} from 'tree-visit';

export type ParentLayer = Extract<Sketch.AnyLayer, { layers: any }>;

export type PageLayer = Sketch.Page['layers'][number];

export type ChildLayer = Exclude<
  Sketch.AnyLayer,
  { _class: 'artboard' | 'symbolMaster' | 'page' }
>;

export type PointsLayer = Extract<Sketch.AnyLayer, { points: any }>;

export const isParentLayer = (layer: Sketch.AnyLayer): layer is ParentLayer => {
  switch (layer._class) {
    case 'artboard':
    case 'group':
    case 'page':
    case 'shapeGroup':
    case 'symbolMaster':
      return true;
    default:
      return false;
  }
};

export const isChildLayer = (layer: Sketch.AnyLayer): layer is ChildLayer => {
  return (
    layer._class !== 'artboard' &&
    layer._class !== 'symbolMaster' &&
    layer._class !== 'page'
  );
};

export const isPointsLayer = (layer: Sketch.AnyLayer): layer is PointsLayer => {
  return 'points' in layer;
};

export const isLayerWithEditedProperty = <T extends Sketch.AnyLayer>(
  layer: Sketch.AnyLayer,
): layer is T & { edited: boolean } => {
  return 'edited' in layer;
};

export const isPageLayer = (layer: Sketch.AnyLayer): layer is Sketch.Page => {
  return layer._class === 'page';
};

export const isTextLayer = (layer: Sketch.AnyLayer): layer is Sketch.Text => {
  return layer._class === 'text';
};

export const isBitmapLayer = (
  layer: Sketch.AnyLayer,
): layer is Sketch.Bitmap => {
  return layer._class === 'bitmap';
};

export const isGroup = (layer: Sketch.AnyLayer): layer is Sketch.Group => {
  return layer._class === 'group';
};

export const isShapeGroup = (
  layer: Sketch.AnyLayer,
): layer is Sketch.ShapeGroup => {
  return layer._class === 'shapeGroup';
};

export const isSymbolMaster = (
  layer: Sketch.AnyLayer,
): layer is Sketch.SymbolMaster => {
  return layer._class === 'symbolMaster';
};

export const isArtboard = (
  layer: Sketch.AnyLayer,
): layer is Sketch.Artboard => {
  return layer._class === 'artboard';
};

export const isSlice = (layer: Sketch.AnyLayer): layer is Sketch.Slice => {
  return layer._class === 'slice';
};

export const isSymbolMasterOrArtboard = (
  layer: Sketch.AnyLayer,
): layer is Sketch.SymbolMaster | Sketch.Artboard => {
  return isSymbolMaster(layer) || isArtboard(layer);
};

export const isSymbolInstance = (
  layer: Sketch.AnyLayer,
): layer is Sketch.SymbolInstance => {
  return layer._class === 'symbolInstance';
};

export const hasTextStyle = (
  layer: Sketch.Text,
): layer is Sketch.Text & { style: { textStyle: Sketch.TextStyle } } => {
  return !!layer.style?.textStyle;
};

export const hasInspectableShadow = (layer: Sketch.AnyLayer): boolean => {
  switch (layer._class) {
    case 'bitmap':
    case 'oval':
    case 'polygon':
    case 'rectangle':
    case 'shapeGroup':
    case 'shapePath':
    case 'star':
    case 'triangle':
    case 'group':
    case 'symbolInstance':
    case 'text':
      return true;
    case 'page':
    case 'artboard':
    case 'MSImmutableHotspotLayer':
    case 'slice':
    case 'symbolMaster':
      return false;
  }
};

export const hasInspectableBorder = (layer: Sketch.AnyLayer): boolean => {
  switch (layer._class) {
    case 'bitmap':
    case 'oval':
    case 'polygon':
    case 'rectangle':
    case 'shapeGroup':
    case 'shapePath':
    case 'star':
    case 'triangle':
    case 'text':
      return true;
    case 'group':
    case 'symbolInstance':
    case 'page':
    case 'artboard':
    case 'MSImmutableHotspotLayer':
    case 'slice':
    case 'symbolMaster':
      return false;
  }
};

export const hasInspectableFill = (layer: Sketch.AnyLayer): boolean => {
  switch (layer._class) {
    case 'bitmap':
    case 'oval':
    case 'polygon':
    case 'rectangle':
    case 'shapeGroup':
    case 'shapePath':
    case 'star':
    case 'triangle':
    case 'text':
      return true;
    case 'group':
    case 'symbolInstance':
    case 'page':
    case 'artboard':
    case 'MSImmutableHotspotLayer':
    case 'slice':
    case 'symbolMaster':
      return false;
  }
};

export const getChildren = <T extends Sketch.AnyLayer>(layer: T): T[] => {
  return isParentLayer(layer) ? (layer.layers as T[]) : [];
};

export const getChildrenReversed = <T extends Sketch.AnyLayer>(
  layer: T,
): T[] => {
  return [...getChildren(layer)].reverse();
};

const INCLUDE_AND_SKIP = 'include_and_skip';
const EXCLUDE_AND_SKIP = 'exclude_and_skip';

type FindAllPredicate<T> = (
  node: T,
  indexPath: IndexPath,
) => boolean | typeof INCLUDE_AND_SKIP | typeof EXCLUDE_AND_SKIP;

function findAllIndexPaths<T>(
  node: T,
  options: BaseOptions<T> & {
    predicate: FindAllPredicate<T>;
  },
): IndexPath[] {
  let found: IndexPath[] = [];

  visitNode(node, {
    onEnter: (child, indexPath) => {
      const result = options.predicate(child, indexPath);

      if (result === true || result === INCLUDE_AND_SKIP) {
        // Copy the indexPath, since indexPath may be mutated
        found.push([...indexPath]);
      }

      if (result === EXCLUDE_AND_SKIP || result === INCLUDE_AND_SKIP) {
        return 'skip';
      }
    },
    getChildren: options.getChildren,
  });

  return found;
}

const findAllLayerIndexPaths = <T extends Sketch.AnyLayer>(
  node: T,
  predicate: FindAllPredicate<T>,
) => {
  return findAllIndexPaths(node, {
    getChildren,
    predicate,
  });
};

export const {
  visit,
  find,
  findAll,
  findIndexPath,
  access,
  accessPath,
  diagram,
} = withOptions<Sketch.AnyLayer>({
  getChildren,
});

/**
 * An alternative to the `find` method that searches within an array, rather than
 * a single layer.
 *
 * This is useful for searching the top-level pages array.
 */
export function findInArray(
  layers: Sketch.AnyLayer[],
  predicate: (layer: Sketch.AnyLayer) => boolean,
): Sketch.AnyLayer | undefined {
  for (let i = 0; i < layers.length; i++) {
    const result = find(layers[i], predicate);

    if (result) return result;
  }
}

export function assign(
  node: ParentLayer,
  indexPath: IndexPath,
  value: Sketch.AnyLayer,
) {
  const parentLayer = access(node, indexPath.slice(0, -1));

  if (!isParentLayer(parentLayer)) {
    console.info('Bad call to Layers.assign()', parentLayer.name);
    return;
  }

  // TODO: We shouldn't assert `PageLayer` here, since it may be incorrect.
  // But we'll need a more sophisticated way to handle generics.
  parentLayer.layers[indexPath[indexPath.length - 1]] = value as PageLayer;
}

export const {
  visit: visitReversed,
  access: accessReversed,
  accessPath: accessPathReversed,
} = withOptions<Sketch.AnyLayer>({
  getChildren: getChildrenReversed,
});

export {
  SKIP,
  STOP,
  INCLUDE_AND_SKIP,
  EXCLUDE_AND_SKIP,
  findAllLayerIndexPaths as findAllIndexPaths,
};

export function getFixedRadius(layer: Sketch.AnyLayer): number {
  return layer._class === 'rectangle' ? layer.fixedRadius : 0;
}

export function isWithinMaskChain(
  parent: ParentLayer,
  reversedChildIndex: number,
) {
  const childLayers = [...parent.layers].reverse();

  const layer = childLayers[reversedChildIndex];

  const remainingSiblings = childLayers.slice(reversedChildIndex + 1);

  let isMasked = false;

  if (!layer.shouldBreakMaskChain) {
    for (let sibling of remainingSiblings) {
      if (sibling.hasClippingMask) {
        isMasked = true;
        break;
      } else if (sibling.shouldBreakMaskChain) {
        break;
      }
    }
  }

  return isMasked;
}
