import produce from 'immer';
import Sketch from 'noya-file-format';
import { Point, Rect } from 'noya-geometry';
import {
  getCursorForCompassDirection,
  ScalingOptions,
  TextSelectionRange,
  UUID,
} from 'noya-state';
import { CSSProperties, ReactNode } from 'react';

export const cardinalDirections = ['n', 'e', 's', 'w'] as const;
export const ordinalDirections = ['ne', 'se', 'sw', 'nw'] as const;

export type CardinalDirection = typeof cardinalDirections[number];
export type OrdinalDirection = typeof ordinalDirections[number];
export type CompassDirection = CardinalDirection | OrdinalDirection;

export const compassDirections: CompassDirection[] = [
  ...cardinalDirections,
  ...ordinalDirections,
];

export function getCardinalDirections(
  direction: CompassDirection,
): CardinalDirection[] {
  return direction.split('') as CardinalDirection[];
}

export type DragHandle = {
  rect: Rect;
  compassDirection: CompassDirection;
};

export type SiblingBlockProps = {
  symbolId: string;
  frame: Rect;
  blockText?: string;
};

export type BlockProps = {
  symbolId: string;
  layer?: Sketch.SymbolInstance;
  frame?: Rect;
  blockText?: string;
  resolvedBlockData?: Sketch.SymbolInstance['resolvedBlockData'];
  getBlock: (symbolId: string) => BlockDefinition;
  children?: ReactNode;
  dataSet?: {
    id: string;
    parentId: string;
  };
};

export type InferBlockProps = {
  frame: Rect;
  blockText?: string;
  siblingBlocks: SiblingBlockProps[];
};

export type BlockDefinition = {
  symbol: Sketch.SymbolMaster;
  parser: 'regular' | 'newlineSeparated' | 'commaSeparated' | 'table';
  infer: (props: InferBlockProps) => number;
  render: (props: BlockProps) => ReactNode;
  hashtags?: string[];
  placeholderText?: string;
  editorVersion?: number;
  usesResolver?: boolean;
};

export type InteractionMethod = 'mouse' | 'keyboard';

export type InferBlockType = (props: InferBlockProps) => DrawableLayerType;

export type DrawableLayerType =
  | 'rectangle'
  | 'oval'
  | 'line'
  | 'text'
  | 'artboard'
  | 'slice'
  | { symbolId: string };

type Append<T extends unknown[], I extends unknown[]> = [...T, ...I];

// These actions need to be augmented by additional state (a snapshot of the
// current page) before being passed to the interaction reducer.
export type SnapshotInteractionAction =
  | [type: 'maybeMove', origin: Point]
  | [type: 'maybeScale', origin: Point, direction: CompassDirection]
  | [type: 'maybeMovePoint', origin: Point]
  | [type: 'maybeMoveControlPoint', origin: Point]
  | [type: 'maybeMoveGradientStop', origin: Point];

export type InteractionAction =
  | [type: 'reset']
  | [type: 'setCursor', cursor?: CSSProperties['cursor']]
  | [
      type: 'insert',
      layerType: DrawableLayerType,
      method: InteractionMethod,
      current?: Point,
    ]
  | [type: `insertingSymbol`, id: UUID, current?: Point]
  | [type: 'editPath', current?: Point]
  | [type: 'drawingShapePath', current?: Point]
  | [type: 'resetEditPath', current?: Point]
  | [type: 'maybeDrawing', origin: Point]
  | [type: 'startDrawing', shapeType: DrawableLayerType, point: Point]
  | [
      type: 'updateDrawing',
      point: Point,
      options?: ScalingOptions,
      shapeType?: DrawableLayerType,
    ]
  | [type: 'maybeMarquee', point: Point, method: InteractionMethod]
  | [type: 'startMarquee', point: Point, selectedIdsSnapshot: string[]]
  | [type: 'updateMarquee', point: Point]
  | [type: 'hoverHandle', direction?: CompassDirection]
  | [type: 'startPanning', point: Point]
  | [type: 'updateMoving', point: Point, inferBlockType?: InferBlockType]
  | [
      type: 'updateScaling',
      point: Point,
      options?: ScalingOptions,
      inferBlockType?: InferBlockType,
    ]
  | [type: 'updatePanning', point: Point]
  | [type: 'enablePanMode']
  | [type: 'enableSelectionMode', method: InteractionMethod]
  | [type: 'maybePan', origin: Point]
  | [type: 'maybeConvertCurveMode', origin: Point]
  | [type: 'movingPoint', origin: Point, current: Point]
  | [type: 'movingControlPoint', origin: Point, current: Point]
  | [type: 'updateMovingPoint', origin: Point, current: Point]
  | [type: 'updateMovingControlPoint', origin: Point, current: Point]
  | [type: 'movingGradientStop', current: Point]
  | [type: 'maybeMoveGradientEllipseLength', origin: Point]
  | [type: 'movingGradientEllipseLength', current: Point]
  | [type: 'editingText', id: UUID, range: TextSelectionRange]
  | [type: 'editingBlock', id: UUID]
  | [type: 'maybeSelectText', origin: Point]
  | [type: 'selectingText', current: Point];

export type InteractionState =
  | {
      type: 'none';
      cursor?: CSSProperties['cursor'];
    }
  | {
      type: 'insert';
      layerType: DrawableLayerType;
      method: InteractionMethod;
      point?: Point;
    }
  | {
      type: 'insertingSymbol';
      symbolID: UUID;
      point?: Point;
    }
  | {
      type: 'editPath';
      point?: Point;
    }
  | {
      type: 'drawingShapePath';
      point?: Point;
    }
  | {
      type: 'maybeDrawing';
      origin: Point;
    }
  | {
      type: 'drawing';
      origin: Point;
      current: Point;
      shapeType: DrawableLayerType;
      options?: ScalingOptions;
    }
  | {
      type: 'selectionMode';
      method: InteractionMethod;
    }
  | {
      type: 'maybeMarquee';
      origin: Point;
      method: InteractionMethod;
    }
  | {
      type: 'marquee';
      origin: Point;
      current: Point;
      selectedIdsSnapshot: string[];
    }
  | {
      type: 'maybeMove';
      origin: Point;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'maybeMovePoint';
      origin: Point;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'maybeConvertCurveMode';
      origin: Point;
    }
  | {
      type: 'maybeMoveControlPoint';
      origin: Point;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'movingPoint';
      origin: Point;
      current: Point;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'movingControlPoint';
      origin: Point;
      current: Point;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'maybeScale';
      origin: Point;
      direction: CompassDirection;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'moving';
      origin: Point;
      current: Point;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'scaling';
      origin: Point;
      current: Point;
      direction: CompassDirection;
      options?: ScalingOptions;
      pageSnapshot: Sketch.Page;
    }
  | { type: 'panMode' }
  | { type: 'maybePan'; origin: Point }
  | { type: 'panning'; previous: Point; next: Point }
  | { type: 'maybeMoveGradientStop'; origin: Point; pageSnapshot: Sketch.Page }
  | {
      type: 'moveGradientStop';
      origin: Point;
      current: Point;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'maybeMoveGradientEllipseLength';
      origin: Point;
    }
  | {
      type: 'moveGradientEllipseLength';
      current: Point;
    }
  | { type: 'editingText'; layerId: UUID; range: TextSelectionRange }
  | { type: 'editingBlock'; layerId: UUID; cursor?: CSSProperties['cursor'] }
  | {
      type: 'maybeSelectingText';
      origin: Point;
      layerId: UUID;
      range: TextSelectionRange;
    }
  | {
      type: 'selectingText';
      origin: Point;
      current: Point;
      layerId: UUID;
      range: TextSelectionRange;
    };

export type InteractionType = InteractionState['type'];

export function interactionReducer(
  state: InteractionState,
  action:
    | InteractionAction
    | Append<SnapshotInteractionAction, [pageSnapshot: Sketch.Page]>,
): InteractionState {
  switch (action[0]) {
    case 'editPath':
    case 'resetEditPath': {
      const [, point] = action;
      return { type: 'editPath', point: point };
    }
    case 'insert': {
      const [, layerType, method, point] = action;
      return { type: action[0], layerType, method, point };
    }
    case 'insertingSymbol': {
      const [, symbolID, point] = action;
      return { type: 'insertingSymbol', symbolID, point };
    }
    case 'maybeMarquee': {
      const [, origin, method] = action;

      return {
        type: 'maybeMarquee',
        origin,
        method,
      };
    }
    case 'startMarquee': {
      const [, point, selectedIdsSnapshot] = action;

      return {
        type: 'marquee',
        origin: point,
        current: point,
        selectedIdsSnapshot,
      };
    }
    case 'updateMarquee': {
      if (state.type !== 'marquee') return state;

      const [, point] = action;

      return produce(state, (draft) => {
        draft.current = point;
      });
    }
    case 'drawingShapePath': {
      const [type, point] = action;

      return {
        type,
        point,
      };
    }
    case 'maybeDrawing': {
      const [, origin] = action;

      return {
        type: 'maybeDrawing',
        origin,
      };
    }
    case 'startDrawing': {
      const [, shapeType, point] = action;

      return {
        type: 'drawing',
        origin: point,
        current: point,
        shapeType,
      };
    }
    case 'updateDrawing': {
      if (state.type !== 'drawing') return state;

      const [, point, options, shapeType] = action;

      return {
        ...state,
        current: point,
        options,
        shapeType: shapeType ?? state.shapeType,
      };
    }
    case 'maybeMove': {
      const [, origin, pageSnapshot] = action;

      return { type: action[0], origin, pageSnapshot };
    }
    case 'maybeScale': {
      const [, origin, direction, pageSnapshot] = action;

      return {
        type: action[0],
        origin,
        direction,
        pageSnapshot,
      };
    }
    case 'maybeMovePoint': {
      const [type, origin, pageSnapshot] = action;

      return {
        type,
        origin,
        pageSnapshot,
      };
    }
    case 'maybeConvertCurveMode': {
      const [type, origin] = action;
      return {
        type,
        origin,
      };
    }
    case 'maybeMoveControlPoint': {
      const [type, origin, pageSnapshot] = action;

      return {
        type,
        origin,
        pageSnapshot,
      };
    }
    case 'movingPoint': {
      const [type, origin, current] = action;

      if (state.type !== 'maybeMovePoint') {
        throw new Error(
          'Bad interaction state - should be in `maybeMovePoint`',
        );
      }

      return {
        type,
        origin,
        current,
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'updateMovingPoint': {
      const [, origin, current] = action;

      if (state.type !== 'movingPoint') {
        throw new Error('Bad interaction state - should be in `movingPoint`');
      }

      return {
        type: 'movingPoint',
        origin,
        current,
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'updateMovingControlPoint': {
      const [, origin, current] = action;

      if (state.type !== 'movingControlPoint') {
        throw new Error(
          'Bad interaction state - should be in `movingControlPoint`',
        );
      }

      return {
        type: 'movingControlPoint',
        origin,
        current,
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'movingControlPoint': {
      const [type, origin, current] = action;

      if (state.type !== 'maybeMoveControlPoint') {
        throw new Error(
          'Bad interaction state - should be in `maybeMoveControlPoint`',
        );
      }

      return {
        type,
        origin,
        current,
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'updateMoving': {
      const [, point] = action;

      if (state.type !== 'moving' && state.type !== 'maybeMove') {
        throw new Error(
          'Bad interaction state - should be in `maybeMove` or `moving`',
        );
      }

      return {
        type: 'moving',
        origin: state.origin,
        current: point,
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'updateScaling': {
      const [, point, options] = action;

      if (state.type !== 'scaling' && state.type !== 'maybeScale') {
        throw new Error(
          'Bad interaction state - should be in `maybeScale` or `scaling`',
        );
      }

      return {
        type: 'scaling',
        origin: state.origin,
        current: point,
        direction: state.direction,
        options,
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'enablePanMode':
      return { type: 'panMode' };
    case 'enableSelectionMode': {
      const [, method] = action;

      return { type: 'selectionMode', method };
    }
    case 'maybePan': {
      const [, origin] = action;

      return { type: 'maybePan', origin };
    }
    case 'startPanning': {
      const [, point] = action;

      if (state.type !== 'maybePan') {
        throw new Error('Bad interaction state - should be in `maybePan`');
      }

      return {
        type: 'panning',
        previous: state.origin,
        next: point,
      };
    }
    case 'updatePanning': {
      const [, point] = action;

      if (state.type !== 'panning') {
        throw new Error('Bad interaction state - should be in `panning`');
      }

      return {
        type: 'panning',
        previous: state.next,
        next: point,
      };
    }
    case 'maybeMoveGradientStop': {
      const [, origin, pageSnapshot] = action;

      return {
        type: 'maybeMoveGradientStop',
        origin,
        pageSnapshot,
      };
    }
    case 'movingGradientStop': {
      const [, current] = action;

      if (
        state.type !== 'maybeMoveGradientStop' &&
        state.type !== 'moveGradientStop'
      ) {
        throw new Error('Bad interaction state');
      }

      return {
        type: 'moveGradientStop',
        pageSnapshot: state.pageSnapshot,
        origin: state.origin,
        current,
      };
    }
    case 'maybeMoveGradientEllipseLength': {
      const [, origin] = action;

      return {
        type: 'maybeMoveGradientEllipseLength',
        origin,
      };
    }
    case 'movingGradientEllipseLength': {
      const [, current] = action;

      if (
        state.type !== 'maybeMoveGradientEllipseLength' &&
        state.type !== 'moveGradientEllipseLength'
      ) {
        throw new Error('Bad interaction state');
      }

      return {
        type: 'moveGradientEllipseLength',
        current,
      };
    }
    case 'editingText': {
      const [, layerId, range] = action;

      return {
        type: 'editingText',
        layerId,
        range,
      };
    }
    case 'editingBlock': {
      const [, layerId] = action;

      return {
        type: 'editingBlock',
        layerId,
      };
    }
    case 'maybeSelectText': {
      const [, origin] = action;

      if (state.type !== 'editingText') {
        throw new Error('Bad interaction state');
      }

      return {
        type: 'maybeSelectingText',
        origin,
        layerId: state.layerId,
        range: state.range,
      };
    }
    case 'selectingText': {
      const [, current] = action;

      if (
        state.type !== 'selectingText' &&
        state.type !== 'maybeSelectingText'
      ) {
        throw new Error('Bad interaction state');
      }

      return {
        type: 'selectingText',
        origin: state.origin,
        current,
        layerId: state.layerId,
        range: state.range,
      };
    }
    case 'hoverHandle': {
      const [, direction] = action;

      if (state.type !== 'none' && state.type !== 'editingBlock') {
        return state;
      }

      return {
        ...state,
        cursor: direction ? getCursorForCompassDirection(direction) : undefined,
      };
    }
    case 'setCursor': {
      const [, cursor] = action;

      if (state.type !== 'none' && state.type !== 'editingBlock') {
        return state;
      }

      return { ...state, cursor };
    }
    case 'reset': {
      return { type: 'none' };
    }
    default:
      return state;
  }
}

export function createInitialInteractionState(): InteractionState {
  return { type: 'none' };
}
