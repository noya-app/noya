import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import {
  AffineTransform,
  createBounds,
  createRect,
  normalizeRect,
  rectContainsPoint,
  rectsIntersect,
  Size,
} from 'noya-geometry';
import { Primitives, uuid } from 'noya-renderer';
import {
  decodeCurvePoint,
  DecodedCurvePoint,
  encodeCurvePoint,
  resizeRect,
  stringifyPoint,
} from 'noya-renderer/src/primitives';
import * as Layers from '../layers';
import * as Models from '../models';
import {
  computeNewBoundingRect,
  EncodedPageMetadata,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getIndexPathOfOpenShapeLayer,
  getSelectedLayerIndexPathsExcludingDescendants,
  getSymbols,
  moveControlPoints,
  moveSelectedPoints,
} from '../selectors/selectors';
import {
  findSmallestSnappingDistance,
  getAxisValues,
  getLayerAxisInfo,
  getPossibleSnapLayers,
  getSnappingPairs,
} from '../snapping';
import { Point, UUID } from '../types';
import { ApplicationState } from './applicationReducer';
import {
  CompassDirection,
  InteractionAction,
  interactionReducer,
} from './interactionReducer';

export type CanvasAction =
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'insertSymbol', symbolId: UUID]
  | [type: 'addDrawnLayer']
  | [type: 'addShapePathLayer', point: Point]
  | [type: 'addPointToPath', point: Point]
  | [
      type: 'interaction',
      // Some actions may need to be augmented by additional state before
      // being passed to nested reducers (e.g. `maybeScale` takes a snapshot
      // of the current page). Maybe there's a better way? This still seems
      // better than moving the whole reducer up into the parent.
      action:
        | Exclude<
            InteractionAction,
            [
              (
                | 'maybeMove'
                | 'maybeScale'
                | 'maybeMovePoint'
                | 'maybeMoveControlPoint'
              ),
              ...any[]
            ]
          >
        | [type: 'maybeMove', origin: Point, canvasSize: Size]
        | [
            type: 'maybeScale',
            origin: Point,
            direction: CompassDirection,
            canvasSize: Size,
          ]
        | [type: 'maybeMovePoint', origin: Point]
        | [type: 'maybeMoveControlPoint', origin: Point],
    ];

export function canvasReducer(
  state: ApplicationState,
  action: CanvasAction,
  CanvasKit: CanvasKit,
): ApplicationState {
  switch (action[0]) {
    case 'insertArtboard': {
      const [, { name, width, height }] = action;
      const pageIndex = getCurrentPageIndex(state);
      const { scrollOrigin } = getCurrentPageMetadata(state);

      return produce(state, (draft) => {
        let layer = produce(Models.artboard, (layer) => {
          layer.do_objectID = uuid();
          layer.name = name;
          layer.frame = {
            _class: 'rect',
            constrainProportions: false,
            // TODO: Figure out positioning based on other artboards.
            // Also, don't hardcode sidebar width.
            x: -scrollOrigin.x + 100,
            y: -scrollOrigin.y + 100,
            width,
            height,
          };
        });

        draft.sketch.pages[pageIndex].layers.push(layer);
        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
        draft.selectedObjects = [layer.do_objectID];
      });
    }
    case 'addDrawnLayer': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        if (draft.interactionState.type !== 'drawing') return;

        const layer = draft.interactionState.value;

        if (layer.frame.width > 0 && layer.frame.height > 0) {
          // Check if the layer intersects any artboards or symbolMasters.
          // If so, we'll insert the layer within
          const parent = draft.sketch.pages[pageIndex].layers
            .filter(
              (layer): layer is Sketch.Artboard | Sketch.SymbolMaster =>
                Layers.isArtboard(layer) || Layers.isSymbolMaster(layer),
            )
            .find((artboard) => rectsIntersect(artboard.frame, layer.frame));

          if (parent && Layers.isChildLayer(layer)) {
            layer.frame.x -= parent.frame.x;
            layer.frame.y -= parent.frame.y;

            parent.layers.push(layer);
          } else {
            draft.sketch.pages[pageIndex].layers.push(layer);
          }

          draft.selectedObjects = [layer.do_objectID];
        }

        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
      });
    }
    case 'insertSymbol': {
      const [, symbolId] = action;
      const symbol = getSymbols(state).find(
        (symbol) => symbol.symbolID === symbolId,
      );

      return produce(state, (draft) => {
        if (!symbol) return;

        const pageIndex = getCurrentPageIndex(state);
        const { scrollOrigin } = getCurrentPageMetadata(state);

        const layer = produce(Models.symbolInstance, (layer) => {
          layer.name = symbol.name;
          layer.do_objectID = uuid();
          layer.frame = {
            ...symbol.frame,
            x: -scrollOrigin.x + 50,
            y: -scrollOrigin.y + 50,
          };
          layer.symbolID = symbol.symbolID;
        });

        draft.sketch.pages[pageIndex].layers.push(layer);
        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
        draft.selectedObjects = [layer.do_objectID];
      });
    }
    case 'addShapePathLayer': {
      const [, point] = action;
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const parent = draft.sketch.pages[pageIndex].layers
          .filter(
            (layer): layer is Sketch.Artboard | Sketch.SymbolMaster =>
              Layers.isArtboard(layer) || Layers.isSymbolMaster(layer),
          )
          .find((artboard) => rectContainsPoint(artboard.frame, point));

        const layer = produce(Models.shapePath, (layer) => {
          const minArea = {
            x: point.x + 1,
            y: point.y + 1,
          };
          layer.do_objectID = uuid();
          layer.frame = {
            _class: 'rect',
            constrainProportions: false,
            ...createRect(point, minArea),
          };
        });

        if (parent && Layers.isChildLayer(layer)) {
          layer.frame.x -= parent.frame.x;
          layer.frame.y -= parent.frame.y;

          parent.layers.push(layer);
        } else {
          draft.sketch.pages[pageIndex].layers.push(layer);
        }

        const encodedPoint: Sketch.CurvePoint = {
          _class: 'curvePoint',
          cornerRadius: 0,
          curveFrom: stringifyPoint({ x: 0, y: 0 }),
          curveTo: stringifyPoint({ x: 0, y: 0 }),
          hasCurveFrom: false,
          hasCurveTo: false,
          curveMode: Sketch.CurveMode.Straight,
          point: stringifyPoint({ x: 0, y: 0 }),
        };

        layer.points = [encodedPoint];

        draft.selectedObjects = [layer.do_objectID];
        draft.selectedPointLists = { [layer.do_objectID]: [0] };
      });
    }
    case 'addPointToPath': {
      const [, point] = action;

      const pointIndexPath = getIndexPathOfOpenShapeLayer(state);

      if (!pointIndexPath) return state;

      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const layer = Layers.access(
          draft.sketch.pages[pageIndex],
          pointIndexPath.indexPath,
        );

        const boundingRect = getBoundingRect(
          draft.sketch.pages[pageIndex],
          AffineTransform.identity,
          [layer.do_objectID],
          {
            clickThroughGroups: true,
            includeHiddenLayers: false,
            includeArtboardLayers: false,
          },
        );

        if (!boundingRect || !layer || !Layers.isPointsLayer(layer)) return;

        // Update all points by first transforming to the canvas's coordinate system
        const decodedPoints = layer.points.map((curvePoint) =>
          decodeCurvePoint(curvePoint, boundingRect),
        );

        const decodedPoint: DecodedCurvePoint = {
          _class: 'curvePoint',
          cornerRadius: 0,
          curveFrom: { x: 0, y: 0 },
          curveTo: { x: 0, y: 0 },
          hasCurveFrom: false,
          hasCurveTo: false,
          curveMode: Sketch.CurveMode.Straight,
          point,
        };

        const newDecodedPoints =
          pointIndexPath.pointIndex === 0
            ? [decodedPoint, ...decodedPoints]
            : [...decodedPoints, decodedPoint];

        layer.frame = {
          ...layer.frame,
          ...computeNewBoundingRect(CanvasKit, newDecodedPoints, layer),
        };

        layer.points = newDecodedPoints.map((decodedCurvePoint, index) =>
          encodeCurvePoint(decodedCurvePoint, layer.frame),
        );

        draft.selectedPointLists[layer.do_objectID] =
          pointIndexPath.pointIndex === 0 ? [0] : [layer.points.length - 1];

        return;
      });
    }
    case 'interaction': {
      const page = getCurrentPage(state);
      const currentPageId = page.do_objectID;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPathsExcludingDescendants(
        state,
      );
      const layerIds = layerIndexPaths.map(
        (indexPath) => Layers.access(page, indexPath).do_objectID,
      );

      const interactionState = interactionReducer(
        state.interactionState,
        action[1][0] === 'maybeScale' ||
          action[1][0] === 'maybeMove' ||
          action[1][0] === 'maybeMovePoint' ||
          action[1][0] === 'maybeMoveControlPoint'
          ? [...action[1], page]
          : action[1],
      );

      return produce(state, (draft) => {
        draft.interactionState = interactionState;
        switch (interactionState.type) {
          case 'editPath': {
            if (action[1][0] === 'resetEditPath') break;

            draft.selectedPointLists = {};

            // Selects the first point in the first selected layer and initializes a point list for each selected layer
            layerIndexPaths.forEach((layerIndex, index) => {
              const layer = Layers.access(page, layerIndex);

              if (Layers.isPointsLayer(layer)) {
                draft.selectedPointLists[layer.do_objectID] =
                  index === 0 ? [0] : [];
              }
            });
            break;
          }
          case 'moving': {
            const { origin, current, pageSnapshot } = interactionState;

            const selectedRect = getBoundingRect(
              pageSnapshot,
              AffineTransform.identity,
              layerIds,
              {
                clickThroughGroups: true,
                includeHiddenLayers: false,
                includeArtboardLayers: false,
              },
            );

            if (!selectedRect) {
              console.info('No selected rect');
              return;
            }

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            const possibleSnapLayers = getPossibleSnapLayers(
              state,
              layerIndexPaths,
              interactionState.canvasSize,
            )
              // Ensure we don't snap to the selected layer itself
              .filter((layer) => !layerIds.includes(layer.do_objectID));

            const snappingLayerInfos = getLayerAxisInfo(
              page,
              possibleSnapLayers,
            );

            // Simulate where the selection rect would be, assuming no snapping
            selectedRect.x += delta.x;
            selectedRect.y += delta.y;

            const selectedBounds = createBounds(selectedRect);

            const xValues = getAxisValues(selectedBounds, 'x');
            const yValues = getAxisValues(selectedBounds, 'y');

            const xPairs = getSnappingPairs(xValues, snappingLayerInfos, 'x');
            const yPairs = getSnappingPairs(yValues, snappingLayerInfos, 'y');

            delta.y -= findSmallestSnappingDistance(yPairs);
            delta.x -= findSmallestSnappingDistance(xPairs);

            layerIndexPaths.forEach((indexPath) => {
              const initialRect = Layers.access(pageSnapshot, indexPath).frame;
              const layer = Layers.access(
                draft.sketch.pages[pageIndex],
                indexPath,
              );

              layer.frame.x = initialRect.x + delta.x;
              layer.frame.y = initialRect.y + delta.y;
            });

            break;
          }
          case 'movingPoint': {
            const { current, origin, pageSnapshot } = interactionState;

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            moveSelectedPoints(
              draft.selectedPointLists,
              layerIndexPaths,
              delta,
              'adjust',
              draft.sketch.pages[pageIndex],
              pageSnapshot,
              CanvasKit,
            );

            break;
          }
          case 'movingControlPoint': {
            if (!draft.selectedControlPoint) return;
            const { current, origin, pageSnapshot } = interactionState;

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            moveControlPoints(
              draft.selectedControlPoint,
              layerIndexPaths,
              delta,
              'adjust',
              draft.sketch.pages[pageIndex],
              pageSnapshot,
              CanvasKit,
            );
            break;
          }
          case 'scaling': {
            const {
              origin,
              current,
              pageSnapshot,
              direction,
            } = interactionState;

            const originalBoundingRect = getBoundingRect(
              pageSnapshot,
              AffineTransform.identity,
              layerIds,
            )!;

            const newBoundingRect = resizeRect(
              originalBoundingRect,
              {
                x: current.x - origin.x,
                y: current.y - origin.y,
              },
              direction,
            );

            const originalTransform = AffineTransform.multiply(
              AffineTransform.translation(
                originalBoundingRect.x,
                originalBoundingRect.y,
              ),
              AffineTransform.scale(
                originalBoundingRect.width,
                originalBoundingRect.height,
              ),
            ).invert();

            const newTransform = AffineTransform.multiply(
              AffineTransform.translation(newBoundingRect.x, newBoundingRect.y),
              AffineTransform.scale(
                newBoundingRect.width,
                newBoundingRect.height,
              ),
            );

            layerIndexPaths.forEach((layerIndex) => {
              const originalLayer = Layers.access(pageSnapshot, layerIndex);

              const layerTransform = AffineTransform.multiply(
                ...Layers.accessPath(pageSnapshot, layerIndex)
                  .slice(1, -1) // Remove the page and current layer
                  .map((layer) =>
                    AffineTransform.translation(layer.frame.x, layer.frame.y),
                  )
                  .reverse(),
              );

              const newLayer = Layers.access(
                draft.sketch.pages[pageIndex],
                layerIndex,
              );

              const min = AffineTransform.multiply(
                layerTransform.invert(),
                newTransform,
                originalTransform,
                layerTransform,
              ).applyTo({
                x: originalLayer.frame.x,
                y: originalLayer.frame.y,
              });

              const max = AffineTransform.multiply(
                layerTransform.invert(),
                newTransform,
                originalTransform,
                layerTransform,
              ).applyTo({
                x: originalLayer.frame.x + originalLayer.frame.width,
                y: originalLayer.frame.y + originalLayer.frame.height,
              });

              const newFrame = normalizeRect({
                x: Math.round(min.x),
                y: Math.round(min.y),
                width: Math.round(max.x - min.x),
                height: Math.round(max.y - min.y),
              });

              newLayer.frame.x = newFrame.x;
              newLayer.frame.y = newFrame.y;
              newLayer.frame.width = newFrame.width;
              newLayer.frame.height = newFrame.height;
            });

            break;
          }
          case 'panning': {
            const { previous, next } = interactionState;

            const delta = {
              x: next.x - previous.x,
              y: next.y - previous.y,
            };

            const meta: EncodedPageMetadata = draft.sketch.user[
              currentPageId
            ] ?? {
              zoomValue: 1,
              scrollOrigin: '{100,100}',
            };

            const parsed = Primitives.parsePoint(meta.scrollOrigin);

            parsed.x += delta.x;
            parsed.y += delta.y;

            draft.sketch.user[currentPageId] = {
              ...meta,
              scrollOrigin: Primitives.stringifyPoint(parsed),
            };

            break;
          }
        }
      });
    }
    default:
      return state;
  }
}
