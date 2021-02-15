import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { withOptions, SKIP, STOP } from 'tree-visit';

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

export const {
  visit,
  find,
  findIndexPath,
  findAllIndexPaths,
  access,
} = withOptions<Sketch.AnyLayer>({
  getChildren,
});

export { SKIP, STOP };
