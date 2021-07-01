import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { createRect, Size } from 'noya-geometry';
import type { PageLayer } from '..';
import * as Models from '../models';
import { Point, Rect, UUID } from '../types';

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

export type ShapeType =
  | 'rectangle'
  | 'oval'
  | 'text'
  | 'artboard'
  | 'shapePath';

export type InteractionAction =
  | ['reset']
  | [`insert${Capitalize<ShapeType>}`]
  | [type: 'editPath']
  | [type: 'createPath']
  | [type: 'startDrawingPath', current: Point]
  | [type: 'updateDrawingPath', current: Point]
  | [
      type: 'startDrawingShapePath',
      shapeType: ShapeType,
      id: UUID,
      point: Point,
    ]
  | [type: 'resetEditPath']
  | [type: 'startDrawing', shapeType: ShapeType, id: UUID, point: Point]
  | [type: 'updateDrawing', point: Point]
  | [type: 'startMarquee', point: Point]
  | [type: 'updateMarquee', point: Point]
  | [
      type: 'maybeMove',
      origin: Point,
      canvasSize: Size,
      pageSnapshot: Sketch.Page,
    ]
  | [type: 'hoverHandle', direction: CompassDirection]
  | [
      type: 'maybeScale',
      origin: Point,
      direction: CompassDirection,
      canvasSize: Size,
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
  | [type: 'maybeMovePoint', origin: Point, pageSnapshot: Sketch.Page]
  | [type: 'maybeMoveControlPoint', origin: Point, pageSnapshot: Sketch.Page]
  | [type: 'movingPoint', origin: Point, current: Point]
  | [type: 'movingControlPoint', origin: Point, current: Point]
  | [type: 'updateMovingPoint', origin: Point, current: Point]
  | [type: 'updateMovingControlPoint', origin: Point, current: Point];

export type InteractionState =
  | {
      type: 'none';
    }
  | {
      type: `insert${Capitalize<ShapeType>}`;
    }
  | {
      type: 'editPath';
    }
  | {
      type: 'createPath';
    }
  | {
      type: 'startDrawingPath';
      current: Point;
    }
  | {
      type: 'updateDrawingPath';
      current: Point;
    }
  | {
      type: 'startDrawingShapePath';
      shapeType: ShapeType;
      id: UUID;
      point: Point;
    }
  | {
      type: 'drawing';
      origin: Point;
      value: PageLayer;
    }
  | {
      type: 'drawingShapePath';
      point: Point;
      layer: PageLayer;
    }
  | {
      type: 'marquee';
      origin: Point;
      current: Point;
    }
  | {
      type: 'maybeMove';
      origin: Point;
      canvasSize: Size;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'maybeMovePoint';
      origin: Point;
      pageSnapshot: Sketch.Page;
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
      canvasSize: Size;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'moving';
      origin: Point;
      current: Point;
      canvasSize: Size;
      pageSnapshot: Sketch.Page;
    }
  | {
      type: 'scaling';
      origin: Point;
      current: Point;
      direction: CompassDirection;
      canvasSize: Size;
      pageSnapshot: Sketch.Page;
    }
  | { type: 'panMode' }
  | { type: 'maybePan'; origin: Point }
  | { type: 'panning'; previous: Point; next: Point };

export type InteractionType = InteractionState['type'];

type CreateLayerReturnType =
  | Sketch.Oval
  | Sketch.Rectangle
  | Sketch.Text
  | Sketch.Artboard
  | Sketch.ShapePath;

function createLayer(shapeType: ShapeType): CreateLayerReturnType {
  switch (shapeType) {
    case 'oval':
      return Models.oval;
    case 'rectangle':
      return Models.rectangle;
    case 'text':
      return Models.text;
    case 'artboard':
      return Models.artboard;
    case 'shapePath':
      return Models.shapePath;
  }
}

export function interactionReducer(
  state: InteractionState,
  action: InteractionAction,
): InteractionState {
  switch (action[0]) {
    case 'editPath':
    case 'resetEditPath':
      return { type: 'editPath' };
    case 'createPath': {
      return { type: 'createPath' };
    }
    case 'insertArtboard':
    case 'insertOval':
    case 'insertRectangle':
    case 'insertText': {
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

      return produce(state, (draft) => {
        draft.current = point;
      });
    }
    case 'startDrawingPath': {
      const [type, current] = action;

      return {
        type,
        current,
      };
    }
    case 'updateDrawingPath': {
      const [, current] = action;

      return {
        type: 'startDrawingPath',
        current,
      };
    }
    case 'startDrawingShapePath': {
      const [, shapeType, id, point] = action;

      let layer = produce(createLayer(shapeType), (layer) => {
        const test = {
          x: point.x + 1,
          y: point.y + 1,
        };
        layer.do_objectID = id;
        layer.frame = {
          _class: 'rect',
          constrainProportions: false,
          ...createRect(point, test),
        };
      });

      return {
        type: 'drawingShapePath',
        layer,
        point,
      };
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

      return produce(state, (draft) => {
        draft.value.frame = {
          ...draft.value.frame,
          ...rect,
        };
      });
    }
    case 'maybeMove': {
      const [, origin, canvasSize, pageSnapshot] = action;

      return { type: action[0], origin, canvasSize, pageSnapshot };
    }
    case 'maybeScale': {
      const [, origin, direction, canvasSize, pageSnapshot] = action;

      return {
        type: action[0],
        origin,
        direction,
        canvasSize,
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
    case 'startMoving': {
      const [, point] = action;

      if (state.type !== 'maybeMove') {
        throw new Error('Bad interaction state - should be in `maybeMove`');
      }

      return {
        type: 'moving',
        origin: state.origin,
        current: point,
        canvasSize: state.canvasSize,
        pageSnapshot: state.pageSnapshot,
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
        canvasSize: state.canvasSize,
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
        origin: state.origin,
        current: point,
        canvasSize: state.canvasSize,
        pageSnapshot: state.pageSnapshot,
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
        canvasSize: state.canvasSize,
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
