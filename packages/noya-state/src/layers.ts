import Sketch from '@sketch-hq/sketch-file-format-ts';
import { sketchColorToRgbaString } from 'noya-designsystem';
import { round } from 'noya-utils';
import {
  withOptions,
  SKIP,
  STOP,
  BaseOptions,
  IndexPath,
  visit as visitNode,
} from 'tree-visit';
import { parsePoint } from './primitives';

export type ParentLayer = Extract<Sketch.AnyLayer, { layers: any }>;

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
    case 'star':
    case 'triangle':
    case 'group':
    case 'symbolInstance':
    case 'text':
      return true;
    case 'shapePath':
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
    case 'star':
    case 'triangle':
    case 'text':
      return true;
    case 'group':
    case 'symbolInstance':
    case 'shapePath':
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

export function summary(
  root: Sketch.AnyLayer,
  options?: { fills?: boolean; borders?: boolean; points?: boolean },
) {
  const includeFills = options?.fills ?? false;
  const includeBorders = options?.borders ?? false;
  const includePoints = options?.points ?? false;

  function describeCurvePoint(curvePoint: Sketch.CurvePoint) {
    const point = parsePoint(curvePoint.point);
    return `  * { x: ${round(point.x, 2)}, y: ${round(point.y, 2)} } (${
      Sketch.CurveMode[curvePoint.curveMode]
    })`;
  }

  function describeFill(fill: Sketch.Fill | Sketch.Border) {
    const typeString = Sketch.FillType[fill.fillType];
    switch (fill.fillType) {
      case Sketch.FillType.Color:
        return `  * ${fill._class} (${typeString}) ${sketchColorToRgbaString(
          fill.color,
        )}`;
      default:
        return `  * ${fill._class} (${typeString})`;
    }
  }

  return diagram(root, {
    getChildren,
    getLabel: (layer) => {
      const { x, y, width, height } = layer.frame;
      const pairs = [
        ['x', round(x, 2)],
        ['y', round(y, 2)],
        ['w', round(width, 2)],
        ['h', round(height, 2)],
      ] as const;
      const frameString = pairs
        .map((pair) => `${pair[0]}: ${pair[1]}`)
        .join(', ');
      return [
        `${layer.name} (${layer._class}) { ${frameString} }`,
        ...(includeFills ? (layer.style?.fills ?? []).map(describeFill) : []),
        ...(includeBorders
          ? (layer.style?.borders ?? []).map(describeFill)
          : []),
        ...(includePoints
          ? (isPointsLayer(layer) ? layer.points : []).map(describeCurvePoint)
          : []),
      ]
        .filter((s) => !!s)
        .join('\n');
    },
    flattenSingleChildNodes: false,
  });
}
