import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { AffineTransform, createBounds, normalizeRect } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import {
  decodeCurvePoint,
  DecodedCurvePoint,
  encodeCurvePoint,
  Primitives,
  resizeRect,
} from 'noya-state';
import { uuid } from 'noya-utils';
import * as Layers from '../layers';
import {
  addToParentLayer,
  computeNewBoundingRect,
  EncodedPageMetadata,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getIndexPathOfOpenShapeLayer,
  getSelectedLayerIndexPathsExcludingDescendants,
  getSymbols,
  isLine,
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
import { Point, Rect } from '../types';
import { ApplicationState } from './applicationReducer';
import {
  InteractionAction,
  interactionReducer,
  SnapshotInteractionAction,
} from './interactionReducer';
import { defaultBorderColor } from './styleReducer';

export type CanvasAction =
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'addDrawnLayer']
  | [type: 'addShapePathLayer', point: Point]
  | [type: 'addSymbolLayer', symbolId: string, point: Point]
  | [
      type: 'insertBitmap',
      file: ArrayBuffer,
      details: { name: string; frame: Rect; extension: string },
    ]
  | [type: 'addPointToPath', point: Point]
  | [type: 'pan', point: Point]
  | [
      type: 'interaction',
      action: InteractionAction | SnapshotInteractionAction,
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
        const layer = SketchModel.artboard({
          name,
          frame: SketchModel.rect({
            // TODO: Figure out positioning based on other artboards.
            // Also, don't hardcode sidebar width.
            x: -scrollOrigin.x + 100,
            y: -scrollOrigin.y + 100,
            width,
            height,
          }),
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
          addToParentLayer(draft.sketch.pages[pageIndex].layers, layer);
          draft.selectedObjects = [layer.do_objectID];
        }

        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
      });
    }
    case 'addShapePathLayer': {
      const [, point] = action;
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const layer = SketchModel.shapePath({
          frame: SketchModel.rect({
            x: point.x,
            y: point.y,
            width: 1,
            height: 1,
          }),
          style: SketchModel.style({
            borders: [
              SketchModel.border({
                color: defaultBorderColor,
              }),
            ],
          }),
          isClosed: false,
        });

        addToParentLayer(draft.sketch.pages[pageIndex].layers, layer);

        const decodedPoint: DecodedCurvePoint = {
          _class: 'curvePoint',
          cornerRadius: 0,
          curveFrom: point,
          curveTo: point,
          hasCurveFrom: false,
          hasCurveTo: false,
          curveMode: Sketch.CurveMode.Straight,
          point,
        };

        const encodedPoint = encodeCurvePoint(decodedPoint, layer.frame);
        layer.points = [encodedPoint];

        draft.selectedObjects = [layer.do_objectID];
        draft.selectedPointLists = { [layer.do_objectID]: [0] };
      });
    }
    case 'addSymbolLayer': {
      const [, symbolId, point] = action;
      const pageIndex = getCurrentPageIndex(state);

      const symbol = getSymbols(state).find(
        ({ do_objectID }) => do_objectID === symbolId,
      ) as Sketch.SymbolMaster;

      const layer = SketchModel.symbolInstance({
        name: symbol.name,
        symbolID: symbol.symbolID,
        frame: {
          ...symbol.frame,
          x: point.x - symbol.frame.width / 2,
          y: point.y - symbol.frame.height / 2,
        },
      });

      return produce(state, (draft) => {
        addToParentLayer(draft.sketch.pages[pageIndex].layers, layer);
        draft.selectedObjects = [layer.do_objectID];
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
          curveFrom: point,
          curveTo: point,
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

        if (layer.frame.height === 0 || isLine(layer.points)) {
          layer.frame.height = 1;
        }

        if (layer.frame.width === 0 || isLine(layer.points)) {
          layer.frame.width = 1;
        }

        layer.points = newDecodedPoints.map((decodedCurvePoint, index) =>
          encodeCurvePoint(decodedCurvePoint, layer.frame),
        );

        draft.selectedPointLists[layer.do_objectID] =
          pointIndexPath.pointIndex === 0 ? [0] : [layer.points.length - 1];

        draft.selectedControlPoint = undefined;

        return;
      });
    }
    case 'pan': {
      const page = getCurrentPage(state);
      const currentPageId = page.do_objectID;
      const { x, y } = action[1];

      return produce(state, (draft) => {
        const meta: EncodedPageMetadata = draft.sketch.user[currentPageId] ?? {
          zoomValue: 1,
          scrollOrigin: '{100,100}',
        };

        const parsed = Primitives.parsePoint(meta.scrollOrigin);

        parsed.x -= x;
        parsed.y -= y;

        draft.sketch.user[currentPageId] = {
          ...meta,
          scrollOrigin: Primitives.stringifyPoint(parsed),
        };
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

              const width = max.x - min.x;
              const height = max.y - min.y;

              const newFrame = normalizeRect({
                x: Math.round(min.x),
                y: Math.round(min.y),
                width: Math.round(width),
                height: Math.round(height),
              });

              newLayer.isFlippedHorizontal = width < 0;
              newLayer.isFlippedVertical = height < 0;

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
    case 'insertBitmap': {
      const [, file, { name, frame, extension }] = action;
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const _ref = `images/${uuid()}.${extension}`;

        draft.sketch.images[_ref] = file;

        const layer = SketchModel.bitmap({
          name: name.replace(`.${extension}`, ''),
          image: SketchModel.fileReference({ _ref }),
          frame: SketchModel.rect(frame),
        });

        addToParentLayer(draft.sketch.pages[pageIndex].layers, layer);
      });
    }
    default:
      return state;
  }
}
