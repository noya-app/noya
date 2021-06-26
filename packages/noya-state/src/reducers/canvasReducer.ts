import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import {
  AffineTransform,
  createBounds,
  createRectFromBounds,
  distance,
  normalizeRect,
  Rect,
  rectsIntersect,
  Size,
} from 'noya-geometry';
import { Primitives, uuid } from 'noya-renderer';
import {
  decodeCurvePoint,
  encodeCurvePoint,
  resizeRect,
} from 'noya-renderer/src/primitives';
import { path } from '../../../noya-renderer/src/primitives/path';
import * as Layers from '../layers';
import * as Models from '../models';
import {
  EncodedPageMetadata,
  getBoundingRect,
  getBoundingRectMap,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getSelectedLayerIndexPathsExcludingDescendants,
} from '../selectors/selectors';
import {
  findSmallestSnappingDistance,
  getAxisValues,
  getSnappingPairs,
  getPossibleSnapLayers,
  getLayerAxisInfo,
} from '../snapping';
import { Point } from '../types';
import { ApplicationState, SelectedControlPoint } from './applicationReducer';
import {
  CompassDirection,
  InteractionAction,
  interactionReducer,
} from './interactionReducer';
import { SelectedPoint } from './pointReducer';

export type CanvasAction =
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'addDrawnLayer']
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
              'maybeMove' | 'maybeScale' | 'movingPoint' | 'movingControlPoint',
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
        | [
            type: 'movingPoint',
            origin: Point,
            current: Point,
            selectedPoint: SelectedPoint,
          ]
        | [
            type: 'movingControlPoint',
            origin: Point,
            current: Point,
            selectedPoint: SelectedControlPoint,
          ],
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
        action[1][0] === 'maybeScale' || action[1][0] === 'maybeMove'
          ? [...action[1], page]
          : action[1],
      );

      return produce(state, (draft) => {
        draft.interactionState = interactionState;

        switch (interactionState.type) {
          case 'editPath': {
            //Selects the first point in the first selected layer and initializes a point list for each selected layer
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
            const { current, selectedPoint } = interactionState;

            const boundingRects = getBoundingRectMap(
              getCurrentPage(state),
              Object.keys(state.selectedPointLists),
              {
                clickThroughGroups: true,
                includeArtboardLayers: false,
                includeHiddenLayers: false,
              },
            );

            layerIndexPaths.forEach((indexPath) => {
              const page = draft.sketch.pages[pageIndex];
              const layer = Layers.access(page, indexPath);
              const pointList = state.selectedPointLists[layer.do_objectID];
              const boundingRect = boundingRects[layer.do_objectID];

              if (!Layers.isPointsLayer(layer) || !boundingRect) return;

              const pointToMeasureFrom = decodeCurvePoint(
                layer.points[selectedPoint[1]],
                boundingRect,
              );
              const delta = {
                x: current.x - pointToMeasureFrom.point.x,
                y: current.y - pointToMeasureFrom.point.y,
              };

              // Update all points by first transforming to the canvas's coordinate system
              layer.points
                .filter((_, index) => pointList.includes(index))
                .forEach((curvePoint) => {
                  const decodedPoint = decodeCurvePoint(
                    curvePoint,
                    boundingRect,
                  );
                  (['point', 'curveFrom', 'curveTo'] as const).forEach(
                    (key) => {
                      decodedPoint[key] = {
                        x: decodedPoint[key].x + delta.x,
                        y: decodedPoint[key].y + delta.y,
                      };
                    },
                  );

                  const encodedPoint = encodeCurvePoint(
                    decodedPoint,
                    boundingRect,
                  );

                  curvePoint.point = encodedPoint.point;
                  curvePoint.curveFrom = encodedPoint.curveFrom;
                  curvePoint.curveTo = encodedPoint.curveTo;
                });

              const decodedPoints = layer.points.map((curvePoint) =>
                decodeCurvePoint(curvePoint, boundingRect),
              );

              // Determine the new bounds of the updated points
              const newBounds = {
                minX: Math.min(
                  ...decodedPoints.map((curvePoint) => curvePoint.point.x),
                ),
                maxX: Math.max(
                  ...decodedPoints.map((curvePoint) => curvePoint.point.x),
                ),
                minY: Math.min(
                  ...decodedPoints.map((curvePoint) => curvePoint.point.y),
                ),
                maxY: Math.max(
                  ...decodedPoints.map((curvePoint) => curvePoint.point.y),
                ),
              };

              layer.frame = {
                ...layer.frame,
                ...createRectFromBounds(newBounds),
              };

              // Transform back to the range [0, 1], using the new bounds
              const encodedPoints = decodedPoints.map((decodedCurvePoint) =>
                encodeCurvePoint(decodedCurvePoint, layer.frame),
              );

              layer.points = encodedPoints;
            });

            break;
          }
          case 'movingControlPoint': {
            if (!state.selectedControlPoint) return state;
            const { current, selectedPoint } = interactionState;

            // const [a, b, c, d, canvasKit] = action;
            const {
              layerId,
              pointIndex,
              controlPointType,
            } = state.selectedControlPoint;

            //const axis = type === 'setControlPointX' ? 'x' : 'y';

            //  const pageIndex = getCurrentPageIndex(state);
            // const layerIndexPaths = getSelectedLayerIndexPaths(state);
            const boundingRects = getBoundingRectMap(
              getCurrentPage(state),
              [layerId],
              {
                clickThroughGroups: true,
                includeArtboardLayers: false,
                includeHiddenLayers: false,
              },
            );

            layerIndexPaths.forEach((indexPath) => {
              const page = draft.sketch.pages[pageIndex];
              const layer = Layers.access(page, indexPath);
              const boundingRect = boundingRects[layer.do_objectID];

              if (!Layers.isPointsLayer(layer) || !boundingRect) return;

              const pointToMeasureFrom = decodeCurvePoint(
                layer.points[selectedPoint.pointIndex],
                boundingRect,
              );
              const delta = {
                x: current.x - pointToMeasureFrom.point.x,
                y: current.y - pointToMeasureFrom.point.y,
              };

              const curveMode = layer.points[pointIndex].curveMode;

              // Update all points by first transforming to the canvas's coordinate system
              const decodedPoints = layer.points.map((curvePoint) =>
                decodeCurvePoint(curvePoint, boundingRect),
              );

              const decodedPoint = decodedPoints[pointIndex];

              const oppositeControlPointType =
                controlPointType === 'curveFrom' ? 'curveTo' : 'curveFrom';

              const controlPoint = decodedPoint[controlPointType];
              const oppositeControlPoint =
                decodedPoint[oppositeControlPointType];

              const selectedControlPointValueX = controlPoint.x + delta.x;
              const selectedControlPointValueY = controlPoint.y + delta.y;

              const deltaX = controlPoint.x - selectedControlPointValueX;
              const deltaY = controlPoint.y - selectedControlPointValueY;

              const oppositeControlPointDistance = distance(
                decodedPoint.point,
                oppositeControlPoint,
              );

              switch (curveMode) {
                case Sketch.CurveMode.Mirrored:
                  controlPoint.x = selectedControlPointValueX;
                  controlPoint.y = selectedControlPointValueY;

                  oppositeControlPoint.x += deltaX;
                  oppositeControlPoint.y += deltaY;
                  break;
                case Sketch.CurveMode.Asymmetric:
                  controlPoint.x = selectedControlPointValueX;
                  controlPoint.y = selectedControlPointValueY;

                  let theta =
                    Math.atan2(
                      controlPoint.y - decodedPoint.point.y,
                      controlPoint.x - decodedPoint.point.x,
                    ) + Math.PI;

                  const oppositeControlPointValue = {
                    x:
                      oppositeControlPointDistance * Math.cos(theta) +
                      decodedPoint.point.x,
                    y:
                      oppositeControlPointDistance * Math.sin(theta) +
                      decodedPoint.point.y,
                  };

                  decodedPoint[
                    oppositeControlPointType
                  ] = oppositeControlPointValue;
                  break;
                default:
                  controlPoint.x = selectedControlPointValueX;
                  controlPoint.y = selectedControlPointValueY;
              }

              const [minX, minY, maxX, maxY] = path(
                CanvasKit,
                layer.points,
                layer.frame,
              ).computeTightBounds();

              const newRect: Rect = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
              };

              layer.frame = {
                ...layer.frame,
                ...newRect,
              };

              // Transform back to the range [0, 1], using the new bounds
              const encodedPoints = decodedPoints.map((decodedCurvePoint) =>
                encodeCurvePoint(decodedCurvePoint, layer.frame),
              );

              layer.points = encodedPoints;
            });

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
