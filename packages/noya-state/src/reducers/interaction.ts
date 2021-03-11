import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import type { PageLayer } from '..';
import { Point, Rect, UUID } from '../types';
import * as Models from '../models';
import { createRect } from 'noya-renderer/src/primitives';

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
  | [type: 'startMarquee', point: Point]
  | [type: 'updateMarquee', point: Point]
  | [type: 'maybeMove', origin: Point]
  | [type: 'hoverHandle', direction: CompassDirection]
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
  | [type: 'enablePanMode']
  | [type: 'modifyColor']
  | [type: 'addColor'];

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
  | {
      type: 'marquee';
      origin: Point;
      current: Point;
    }
  | { type: 'maybeMove'; origin: Point }
  | { type: 'hoverHandle'; direction: CompassDirection }
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
  | { type: 'panning'; previous: Point; next: Point }
  | { type: 'addColor' };

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
    case 'insertText': 
    case 'addColor':
    {
      return { type: action[0] };
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

      return produce(state, (state) => {
        state.current = point;
      });
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
