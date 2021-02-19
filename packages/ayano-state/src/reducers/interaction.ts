import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import type { PageLayer } from '..';
import { Point, Rect, UUID } from '../types';
import * as Models from '../models';

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

export type ShapeType = 'rectangle' | 'oval' | 'text' | 'artboard';

export type InteractionAction =
  | ['reset']
  | [`insert${Capitalize<ShapeType>}`]
  | [type: 'startDrawing', shapeType: ShapeType, id: UUID, point: Point]
  | [type: 'updateDrawing', point: Point]
  | [type: 'maybeMove', origin: Point]
  | [
      type: 'maybeScale',
      origin: Point,
      direction: CompassDirection,
      pageSnapshot: Sketch.Page,
    ]
  | [type: 'maybePan', origin: Point]
  | [type: 'startMoving', point: Point]
  | [type: 'startScaling', point: Point]
  | [type: 'startPanning', point: Point]
  | [type: 'updateMoving', point: Point]
  | [type: 'updateScaling', point: Point]
  | [type: 'updatePanning', point: Point]
  | [type: 'enablePanMode'];

export type InteractionState =
  | {
      type: 'none';
    }
  | {
      type: `insert${Capitalize<ShapeType>}`;
    }
  | {
      type: 'drawing';
      origin: Point;
      value: PageLayer;
    }
  | { type: 'maybeMove'; origin: Point }
  | {
      type: 'maybeScale';
      origin: Point;
      direction: CompassDirection;
      pageSnapshot: Sketch.Page;
    }
  | { type: 'moving'; previous: Point; next: Point }
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

/**
 * Create a rectangle with a non-negative width and height
 */
function createRect(initialPoint: Point, finalPoint: Point): Rect {
  return {
    width: Math.abs(finalPoint.x - initialPoint.x),
    height: Math.abs(finalPoint.y - initialPoint.y),
    x: Math.min(finalPoint.x, initialPoint.x),
    y: Math.min(finalPoint.y, initialPoint.y),
  };
}

function createLayer(
  shapeType: ShapeType,
): Sketch.Oval | Sketch.Rectangle | Sketch.Text | Sketch.Artboard {
  switch (shapeType) {
    case 'oval':
      return Models.oval;
    case 'rectangle':
      return Models.rectangle;
    case 'text':
      return Models.text;
    case 'artboard':
      return Models.artboard;
  }
}

export function interactionReducer(
  state: InteractionState,
  action: InteractionAction,
): InteractionState {
  switch (action[0]) {
    case 'insertArtboard':
    case 'insertOval':
    case 'insertRectangle':
    case 'insertText': {
      return { type: action[0] };
    }
    case 'startDrawing': {
      const [, shapeType, id, point] = action;

      let layer = produce(createLayer(shapeType), (layer) => {
        layer.do_objectID = id;
        layer.frame = {
          _class: 'rect',
          constrainProportions: false,
          ...createRect(point, point),
        };
      });

      return {
        type: 'drawing',
        value: layer,
        origin: point,
      };
    }
    case 'updateDrawing': {
      if (state.type !== 'drawing') return state;

      const [, point] = action;

      const rect = createRect(state.origin, point);

      return produce(state, (state) => {
        state.value.frame = {
          ...state.value.frame,
          ...rect,
        };
      });
    }
    case 'maybeMove': {
      const [, origin] = action;

      return { type: action[0], origin };
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
    case 'startMoving': {
      const [, point] = action;

      if (state.type !== 'maybeMove') {
        throw new Error('Bad interaction state - should be in `maybeMove`');
      }

      return {
        type: 'moving',
        previous: state.origin,
        next: point,
      };
    }
    case 'startScaling': {
      const [, point] = action;

      if (state.type !== 'maybeScale') {
        throw new Error('Bad interaction state - should be in `maybeScale`');
      }

      return {
        type: 'scaling',
        origin: state.origin,
        current: point,
        direction: state.direction,
        pageSnapshot: state.pageSnapshot,
      };
    }
    case 'updateMoving': {
      const [, point] = action;

      if (state.type !== 'moving') {
        throw new Error('Bad interaction state - should be in `moving`');
      }

      return {
        type: 'moving',
        previous: state.next,
        next: point,
      };
    }
    case 'updateScaling': {
      const [, point] = action;

      if (state.type !== 'scaling') {
        throw new Error('Bad interaction state - should be in `scaling`');
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
