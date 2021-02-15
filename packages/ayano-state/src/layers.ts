import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  withOptions,
  SKIP,
  STOP,
  BaseOptions,
  IndexPath,
  visit as visitNode,
} from 'tree-visit';

export const getChildren = <T extends Sketch.AnyLayer>(layer: T): T[] => {
  switch (layer._class) {
    case 'page':
      return (layer as Sketch.Page).layers as T[];
    case 'artboard':
      return (layer as Sketch.Artboard).layers as T[];
    default:
      return [];
  }
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
  findIndexPath,
  access,
} = withOptions<Sketch.AnyLayer>({
  getChildren,
});

export {
  SKIP,
  STOP,
  INCLUDE_AND_SKIP,
  EXCLUDE_AND_SKIP,
  findAllLayerIndexPaths as findAllIndexPaths,
};
