import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  withOptions,
  SKIP,
  STOP,
  BaseOptions,
  IndexPath,
  visit as visitNode,
} from 'tree-visit';

export type ParentLayer = Extract<Sketch.AnyLayer, { layers: any }>;

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

export const isTextLayer = (layer: Sketch.AnyLayer): layer is Sketch.Text => {
  return layer._class === 'text';
};

export const isSymbolMaster = (
  layer: Sketch.AnyLayer,
): layer is Sketch.SymbolMaster => {
  return layer._class === 'symbolMaster';
};

export const hasTextStyle = (
  layer: Sketch.Text,
): layer is Sketch.Text & { style: { textStyle: Sketch.TextStyle } } => {
  return !!layer.style?.textStyle;
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

export const {
  visit: visitReversed,
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
