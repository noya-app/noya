import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { Rect, Point } from 'noya-geometry';
import { UUID } from '../types';

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

export type DrawableLayerType =
  | 'rectangle'
  | 'oval'
  | 'text'
  | 'artboard'
  | 'slice';

type Append<T extends unknown[], I extends unknown[]> = [...T, ...I];

// These actions need to be augmented by additional state (a snapshot of the
// current page) before being passed to the interaction reducer.
export type SnapshotInteractionAction =
  | [type: 'maybeMove', origin: Point]
  | [type: 'maybeScale', origin: Point, direction: CompassDirection]
  | [type: 'maybeMovePoint', origin: Point]
  | [type: 'maybeMoveControlPoint', origin: Point];

export type InteractionAction =
  | [type: 'reset']
  | [type: 'insert', layerType: DrawableLayerType, current?: Point]
  | [type: `insertingSymbol`, id: UUID, current?: Point]
  | [type: 'editPath', current?: Point]
  | [type: 'drawingShapePath', current?: Point]
  | [type: 'resetEditPath', current?: Point]
  | [type: 'startDrawing', shapeType: DrawableLayerType, point: Point]
  | [type: 'updateDrawing', point: Point]
  | [type: 'startMarquee', point: Point]
  | [type: 'updateMarquee', point: Point]
  | [type: 'hoverHandle', direction: CompassDirection]
  | [type: 'startPanning', point: Point]
  | [type: 'updateMoving', point: Point]
  | [type: 'updateScaling', point: Point]
  | [type: 'updatePanning', point: Point]
  | [type: 'enablePanMode']
  | [type: 'maybePan', origin: Point]
  | [type: 'maybeConvertCurveMode', origin: Point]
  | [type: 'movingPoint', origin: Point, current: Point]
  | [type: 'movingControlPoint', origin: Point, current: Point]
  | [type: 'updateMovingPoint', origin: Point, current: Point]
  | [type: 'updateMovingControlPoint', origin: Point, current: Point];

export type InteractionState =
  | {
      type: 'none';
    }
  | {
      type: 'insert';
      layerType: DrawableLayerType;
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
      type: 'drawing';
      origin: Point;
      current: Point;
      shapeType: DrawableLayerType;
    }
  | {
      type: 'marquee';
      origin: Point;
      current: Point;
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
  | { type: 'hoverHandle'; direction: CompassDirection }
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
      pageSnapshot: Sketch.Page;
    }
  | { type: 'panMode' }
  | { type: 'maybePan'; origin: Point }
  | { type: 'panning'; previous: Point; next: Point };

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
      const [, layerType, point] = action;
      return { type: action[0], layerType, point };
    }
    case 'insertingSymbol': {
      const [, symbolID, point] = action;
      return { type: 'insertingSymbol', symbolID, point };
    }
    case 'hoverHandle': {
      const [type, direction] = action;

      return { type, direction };
    }
    case 'startMarquee': {
      const [, point] = action;

      return {
        type: 'marquee',
        origin: point,
        current: point,
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

      const [, point] = action;

      return {
        ...state,
        current: point,
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
      const [, point] = action;

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
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'enablePanMode':
      return { type: 'panMode' };
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
