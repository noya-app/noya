import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { interpolateRgba } from 'noya-colorpicker';
import { rgbaToSketchColor, sketchColorToRgba } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createBounds,
  createRect,
  distance,
  getCirclePercentage,
  getClosestPointOnLine,
  getLinePercentage,
  insetRect,
  Point,
  rectContainsPoint,
  resize,
  Size,
} from 'noya-geometry';
import { svgToLayer } from 'noya-import-svg';
import { PointString, SketchModel } from 'noya-sketch-model';
import {
  decodeCurvePoint,
  DecodedCurvePoint,
  encodeCurvePoint,
  Primitives,
  Selectors,
} from 'noya-state';
import { clamp, lerp, uuid, zip } from 'noya-utils';
import * as Layers from '../layers';
import { ScalingOptions } from '../primitives';
import { getLineDragHandleIndexForDirection } from '../selection';
import {
  getAngularGradientCircle,
  getSelectedGradient,
  getSelectedGradientStopPoints,
} from '../selectors/gradientSelectors';
import {
  addToParentLayer,
  computeCurvePointBoundingRect,
  EncodedPageMetadata,
  fixGradientPositions,
  fixGroupFrameHierarchy,
  fixZeroLayerDimensions,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getIndexPathOfOpenShapeLayer,
  getLayerTransformAtIndexPath,
  getParentLayer,
  getParentLayerAtPoint,
  getSelectedLayerIndexPathsExcludingDescendants,
  getSymbols,
  moveControlPoints,
  moveLayer,
  moveSelectedPoints,
  resizeLayerFrame,
} from '../selectors/selectors';
import {
  getScaledSnapBoundingRect,
  getSnapAdjustmentForVisibleLayers,
} from '../snapping';
import {
  ApplicationReducerContext,
  ApplicationState,
} from './applicationReducer';
import {
  DrawableLayerType,
  InteractionAction,
  interactionReducer,
  SnapshotInteractionAction,
} from './interactionReducer';
import { defaultBorderColor, defaultFillColor } from './styleReducer';

export type ImportedImageTarget = 'selectedArtboard' | 'nearestArtboard';

export type InsertedImage = { name: string } & (
  | {
      extension: 'png' | 'jpg' | 'webp' | 'pdf';
      data: ArrayBuffer;
      size: Size;
    }
  | {
      extension: 'svg';
      svgString: string;
    }
);

export type CanvasAction =
  | [type: 'setZoom', value: number, mode?: 'replace' | 'multiply']
  | [
      type: 'zoomToFit',
      target: 'canvas' | 'selection' | { type: 'layer'; value: string },
    ]
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'addDrawnLayer']
  | [type: 'addShapePathLayer', point: Point]
  | [type: 'addSymbolLayer', symbolId: string, point: Point]
  | [type: 'addStopToGradient', point: Point]
  | [type: 'deleteStopToGradient']
  | [
      type: 'importImage',
      images: InsertedImage[],
      insertAt: Point,
      insertInto: ImportedImageTarget,
    ]
  | [type: 'addPointToPath', point: Point]
  | [type: 'insertPointInPath', point: Point]
  | [type: 'moveLayersIntoParentAtPoint', point: Point]
  | [type: 'pan', point: Point]
  | [
      type: 'interaction',
      action: InteractionAction | SnapshotInteractionAction,
    ];

export function canvasReducer(
  state: ApplicationState,
  action: CanvasAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'zoomToFit': {
      const [, target] = action;

      const page = Selectors.getCurrentPage(state);
      let boundingRect =
        target === 'canvas'
          ? Selectors.getPageContentBoundingRect(page)
          : target === 'selection'
          ? Selectors.getBoundingRect(page, state.selectedLayerIds)
          : Selectors.getBoundingRect(page, [target.value]);

      if (!boundingRect) return state;

      // Padding is 10% of the smallest side of the target
      const padding = Math.min(boundingRect.width, boundingRect.height) * 0.1;

      boundingRect = insetRect(boundingRect, -padding, -padding);

      const bounds = createBounds(boundingRect);
      const pageId = getCurrentPage(state).do_objectID;

      const croppedRect = resize(
        boundingRect,
        context.canvasSize,
        'scaleAspectFit',
      );

      const newZoom = Math.min(
        croppedRect.width / boundingRect.width,
        croppedRect.height / boundingRect.height,
      );

      return produce(state, (draft) => {
        const draftUser = draft.sketch.user;

        const viewportCenter = {
          x: context.canvasSize.width / 2,
          y: context.canvasSize.height / 2,
        };

        const newScrollOrigin = {
          x: viewportCenter.x - bounds.midX * newZoom,
          y: viewportCenter.y - bounds.midY * newZoom,
        };

        draftUser[pageId] = {
          ...draftUser[pageId],
          zoomValue: newZoom,
          scrollOrigin: PointString.encode(newScrollOrigin),
        };
      });
    }
    case 'setZoom': {
      const [, value, mode] = action;
      const pageId = getCurrentPage(state).do_objectID;
      const { scrollOrigin, zoomValue } = getCurrentPageMetadata(state);

      return produce(state, (draft) => {
        const draftUser = draft.sketch.user;

        const newValue = clamp(
          mode === 'multiply' ? value * zoomValue : value,
          0.01,
          256,
        );

        const viewportCenter = {
          x: context.canvasSize.width / 2,
          y: context.canvasSize.height / 2,
        };

        // To find the new scrollOrigin: start at the viewport center and
        // move by the scaled the distance to the scrollOrigin
        const newScrollOrigin = AffineTransform.translate(
          (scrollOrigin.x - viewportCenter.x) * (newValue / zoomValue),
          (scrollOrigin.y - viewportCenter.y) * (newValue / zoomValue),
        ).applyTo(viewportCenter);

        draftUser[pageId] = {
          ...draftUser[pageId],
          zoomValue: newValue,
          scrollOrigin: PointString.encode(newScrollOrigin),
        };
      });
    }
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
        draft.selectedLayerIds = [layer.do_objectID];
      });
    }
    case 'addStopToGradient': {
      const [, point] = action;
      const pageIndex = getCurrentPageIndex(state);
      const position = Selectors.getPercentageOfPointInGradient(state, point);

      if (!state.selectedGradient) return state;

      const { layerId, fillIndex, styleType } = state.selectedGradient;

      const page = getCurrentPage(state);
      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        const layer = Layers.access(draft.sketch.pages[pageIndex], indexPath);

        if (
          layer.style?.[styleType]?.[fillIndex].fillType !==
          Sketch.FillType.Gradient
        )
          return state;

        const gradientStops =
          layer.style?.[styleType]?.[fillIndex].gradient.stops;

        if (!gradientStops) return;

        const gradient = gradientStops.map((g) => ({
          color: sketchColorToRgba(g.color),
          position: g.position,
        }));

        const color = rgbaToSketchColor(interpolateRgba(gradient, position));
        gradientStops.push(SketchModel.gradientStop({ color, position }));

        gradientStops.sort((a, b) => a.position - b.position);
        const nextIndex = gradientStops.findIndex(
          (g) => g.position === position,
        );

        if (!draft.selectedGradient) return state;
        draft.selectedGradient.stopIndex =
          nextIndex === -1 ? gradientStops.length - 1 : nextIndex;
      });
    }
    case 'addDrawnLayer': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        if (draft.interactionState.type !== 'drawing') return;

        const shapeType = draft.interactionState.shapeType;
        const layer = createDrawingLayer(
          CanvasKit,
          shapeType,
          SketchModel.style({
            fills: [
              SketchModel.fill({
                color: defaultFillColor,
              }),
            ],
            borders: [
              SketchModel.border({
                color: defaultBorderColor,
              }),
            ],
          }),
          draft.interactionState.origin,
          draft.interactionState.current,
          false,
          {
            constrainProportions: state.keyModifiers.shiftKey,
            scalingOriginMode: state.keyModifiers.altKey ? 'center' : 'extent',
          },
        );

        if (shapeType === 'text') {
          if (layer.frame.width < 10) {
            layer.frame.width = 100;
          }
          if (layer.frame.height < 10) {
            layer.frame.height = 30;
          }
        }

        if (layer.frame.width > 0 && layer.frame.height > 0) {
          addToParentLayer(draft.sketch.pages[pageIndex].layers, layer);
          draft.selectedLayerIds = [layer.do_objectID];
        }

        if (shapeType === 'text') {
          draft.interactionState = interactionReducer(draft.interactionState, [
            'editingText',
            layer.do_objectID,
            { anchor: 0, head: 0 },
          ]);
        } else {
          draft.interactionState = interactionReducer(draft.interactionState, [
            'reset',
          ]);
        }
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

        draft.selectedLayerIds = [layer.do_objectID];
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
        draft.selectedLayerIds = [layer.do_objectID];
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
          [layer.do_objectID],
          { groups: 'childrenOnly' },
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

        const isLastPointSelected =
          pointIndexPath.pointIndex === layer.points.length - 1;

        const newDecodedPoints = isLastPointSelected
          ? [...decodedPoints, decodedPoint]
          : [decodedPoint, ...decodedPoints];

        layer.frame = {
          ...layer.frame,
          ...computeCurvePointBoundingRect(
            CanvasKit,
            newDecodedPoints,
            layer.frame,
            layer.isClosed,
          ),
        };

        fixZeroLayerDimensions(layer);

        layer.points = newDecodedPoints.map((decodedCurvePoint, index) =>
          encodeCurvePoint(decodedCurvePoint, layer.frame),
        );

        draft.selectedPointLists[layer.do_objectID] = isLastPointSelected
          ? [layer.points.length - 1]
          : [0];

        draft.selectedControlPoint = undefined;
        return;
      });
    }
    case 'deleteStopToGradient': {
      const pageIndex = getCurrentPageIndex(state);

      if (!state.selectedGradient) return state;
      const { layerId, fillIndex, stopIndex, styleType } =
        state.selectedGradient;

      const page = getCurrentPage(state);
      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        const layer = Layers.access(draft.sketch.pages[pageIndex], indexPath);

        if (
          layer.style?.[styleType]?.[fillIndex].fillType !==
          Sketch.FillType.Gradient
        )
          return state;

        const gradientStops =
          layer.style?.[styleType]?.[fillIndex].gradient.stops;

        if (!gradientStops || gradientStops.length <= 2) return;
        gradientStops.splice(stopIndex, 1);

        if (!draft.selectedGradient) return state;
        draft.selectedGradient.stopIndex = Math.max(stopIndex - 1, 0);
      });
    }
    case 'pan': {
      const page = getCurrentPage(state);
      const currentPageId = page.do_objectID;
      const { x, y } = action[1];

      return produce(state, (draft) => {
        const meta: EncodedPageMetadata = draft.sketch.user[currentPageId] ?? {
          zoomValue: 1,
          scrollOrigin: '{0,0}',
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
    case 'moveLayersIntoParentAtPoint': {
      const [, point] = action;

      const page = getCurrentPage(state);
      const parentId =
        getParentLayerAtPoint(page, point)?.do_objectID ?? page.do_objectID;
      const indexPaths = getSelectedLayerIndexPathsExcludingDescendants(state);

      if (
        indexPaths.every(
          (indexPath) =>
            getParentLayer(page, indexPath).do_objectID === parentId,
        ) ||
        indexPaths.some((indexPath) => {
          const layer = Layers.access(page, indexPath) as Layers.ChildLayer;
          return Layers.isArtboard(layer) || Layers.isSymbolMaster(layer);
        })
      )
        return state;

      return moveLayer(state, state.selectedLayerIds, parentId, 'inside');
    }
    case 'insertPointInPath': {
      const [, point] = action;

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = Layers.findAllIndexPaths(
        getCurrentPage(state),
        (layer) => layer.do_objectID in state.selectedPointLists,
      );

      return produce(state, (draft) => {
        const draftLayer = layerIndexPaths
          .map((indexPath) =>
            Layers.access(draft.sketch.pages[pageIndex], indexPath),
          )
          .filter(Layers.isPointsLayer)
          .find((layer) =>
            Selectors.layerPathContainsPoint(CanvasKit, layer, point),
          );

        if (!draftLayer) return;

        const splitParameters = Selectors.getSplitPathParameters(
          CanvasKit,
          draftLayer,
          point,
        );

        if (!splitParameters) return;

        const { segmentIndex, segmentPath, t } = splitParameters;

        const newCurvePoints = Primitives.splitPath(segmentPath, t).map(
          (path) => Primitives.pathToCurvePoints(path, draftLayer.frame),
        );

        const start = draftLayer.points.slice(0, segmentIndex + 1);
        const end = draftLayer.points.slice(segmentIndex + 1);
        const joined = Primitives.joinCurvePoints(
          [start, ...newCurvePoints, end],
          segmentIndex === draftLayer.points.length - 1,
        );

        draftLayer.points = joined;
      });
    }
    case 'interaction': {
      const page = getCurrentPage(state);
      const currentPageId = page.do_objectID;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths =
        getSelectedLayerIndexPathsExcludingDescendants(state);

      const layerIds = layerIndexPaths.map(
        (indexPath) => Layers.access(page, indexPath).do_objectID,
      );
      const interactionState = interactionReducer(
        state.interactionState,
        action[1][0] === 'maybeScale' ||
          action[1][0] === 'maybeMove' ||
          action[1][0] === 'maybeMovePoint' ||
          action[1][0] === 'maybeMoveControlPoint' ||
          action[1][0] === 'maybeMoveGradientStop'
          ? [...action[1], page]
          : action[1],
      );

      return produce(state, (draft) => {
        draft.interactionState = interactionState;

        switch (interactionState.type) {
          case 'maybeMoveGradientStop': {
            if (draft.interactionState.type !== 'maybeMoveGradientStop') return;

            if (!state.selectedGradient) return;

            const gradient = getSelectedGradient(
              draft.sketch.pages[pageIndex],
              state.selectedGradient,
            );

            if (!gradient) return;

            fixGradientPositions(gradient);
            return;
          }
          case 'moveGradientStop': {
            const { origin, current, pageSnapshot } = interactionState;

            if (!state.selectedGradient) return;

            const { layerId, fillIndex, stopIndex, styleType } =
              state.selectedGradient;

            const indexPath = Layers.findIndexPath(
              pageSnapshot,
              (layer) => layer.do_objectID === layerId,
            );

            if (!indexPath) return;

            const layer = Layers.access(pageSnapshot, indexPath);
            const draftLayer = Layers.access(
              draft.sketch.pages[pageIndex],
              indexPath,
            );

            if (
              layer.style?.fills?.[fillIndex]?.fillType !==
                Sketch.FillType.Gradient ||
              draftLayer.style?.fills?.[fillIndex]?.fillType !==
                Sketch.FillType.Gradient
            )
              return;

            const gradient = layer.style?.[styleType]?.[fillIndex].gradient;

            const draftGradient =
              draftLayer.style?.[styleType]?.[fillIndex].gradient;

            if (!gradient || !draftGradient) return;

            const isAngular =
              gradient.gradientType === Sketch.GradientType.Angular;

            if (isAngular) {
              const circle = getAngularGradientCircle(state);

              if (!circle) return;

              const position = getCirclePercentage(
                current,
                circle.center,
                -circle.rotation,
              );

              draftGradient.stops[stopIndex].position = position;
            } else {
              const transform = getLayerTransformAtIndexPath(
                pageSnapshot,
                indexPath,
                AffineTransform.identity,
                'includeLast',
              ).scale(layer.frame.width, layer.frame.height);

              const delta = {
                x: current.x - origin.x,
                y: current.y - origin.y,
              };

              const transformPointString = (pointString: string) => {
                const originalPoint = PointString.decode(pointString);
                const transformedPoint = transform.applyTo(originalPoint);
                transformedPoint.x += delta.x;
                transformedPoint.y += delta.y;
                const newPoint = transform.invert().applyTo(transformedPoint);
                return PointString.encode(newPoint);
              };

              switch (stopIndex) {
                case 0: {
                  draftGradient.from = transformPointString(gradient.from);
                  break;
                }
                case gradient.stops.length - 1: {
                  draftGradient.to = transformPointString(gradient.to);
                  break;
                }
                default: {
                  const from = transform.applyTo(
                    PointString.decode(gradient.from),
                  );
                  const to = transform.applyTo(PointString.decode(gradient.to));
                  const stop = gradient.stops[stopIndex];

                  const stopPoint = {
                    x: lerp(from.x, to.x, stop.position),
                    y: lerp(from.y, to.y, stop.position),
                  };
                  stopPoint.x += delta.x;
                  stopPoint.y += delta.y;

                  const position = getLinePercentage(stopPoint, [from, to]);
                  draftGradient.stops[stopIndex].position = position;
                }
              }
            }

            break;
          }
          case 'moveGradientEllipseLength': {
            const { current } = interactionState;
            if (!state.selectedGradient) return;

            const { layerId, fillIndex } = state.selectedGradient;

            const indexPath = Layers.findIndexPath(
              page,
              (layer) => layer.do_objectID === layerId,
            );

            if (!indexPath) return;

            const draftLayer = Layers.access(
              draft.sketch.pages[pageIndex],
              indexPath,
            );

            if (
              draftLayer.style?.fills?.[fillIndex]?.fillType !==
                Sketch.FillType.Gradient &&
              draftLayer.style?.fills?.[fillIndex]?.gradient.gradientType !==
                Sketch.GradientType.Radial
            )
              return;

            const gradient = draftLayer.style?.fills?.[fillIndex]?.gradient;
            const points = getSelectedGradientStopPoints(state);
            if (!points) return;
            const center = points[0].point;
            const lastPoint = points[points.length - 1].point;

            const radius = distance(center, lastPoint);
            const length = distance(
              current,
              getClosestPointOnLine(current, [center, lastPoint]),
            );

            gradient.elipseLength = length / radius;
            return;
          }
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
          case 'insert': {
            const { point } = interactionState;

            if (!point) return;

            const snapAdjustment = getSnapAdjustmentForVisibleLayers(
              state,
              page,
              context.canvasSize,
              createRect(point, point),
            );

            const newInteractionState = {
              ...interactionState,
              point: {
                x: point.x - snapAdjustment.x,
                y: point.y - snapAdjustment.y,
              },
            };

            draft.interactionState = newInteractionState;
            break;
          }
          case 'drawing': {
            let { origin, current } = interactionState;

            const originAdjustment = getSnapAdjustmentForVisibleLayers(
              state,
              page,
              context.canvasSize,
              createRect(origin, origin),
            );

            const currentAdjustment = getSnapAdjustmentForVisibleLayers(
              state,
              page,
              context.canvasSize,
              createRect(current, current),
            );

            const newInteractionState = {
              ...interactionState,
              origin: {
                x: origin.x - originAdjustment.x,
                y: origin.y - originAdjustment.y,
              },
              current: {
                x: current.x - currentAdjustment.x,
                y: current.y - currentAdjustment.y,
              },
            };

            draft.interactionState = newInteractionState;
            break;
          }
          case 'moving': {
            const { origin, current, pageSnapshot } = interactionState;

            const sourceRect = getBoundingRect(pageSnapshot, layerIds, {
              groups: 'childrenOnly',
            });

            if (!sourceRect) {
              console.info('No selected rect');
              return;
            }

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            // Simulate where the selection rect would be, assuming no snapping
            sourceRect.x += delta.x;
            sourceRect.y += delta.y;

            const snapAdjustment = getSnapAdjustmentForVisibleLayers(
              state,
              pageSnapshot,
              context.canvasSize,
              sourceRect,
              layerIndexPaths,
            );

            delta.x -= snapAdjustment.x;
            delta.y -= snapAdjustment.y;

            layerIndexPaths.forEach((indexPath) => {
              const initialRect = Layers.access(pageSnapshot, indexPath).frame;
              const draftLayer = Layers.access(
                draft.sketch.pages[pageIndex],
                indexPath,
              );

              draftLayer.frame.x = initialRect.x + delta.x;
              draftLayer.frame.y = initialRect.y + delta.y;

              fixGroupFrameHierarchy(
                draft.sketch.pages[pageIndex],
                indexPath.slice(0, -1),
              );
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
            const selectedControlPoint = draft.selectedControlPoint;

            if (!selectedControlPoint) return;

            const indexPath = Layers.findIndexPath(
              page,
              (layer) => layer.do_objectID === selectedControlPoint.layerId,
            );

            if (!indexPath) return state;

            const { current, origin, pageSnapshot } = interactionState;

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            moveControlPoints(
              selectedControlPoint,
              indexPath,
              delta,
              'adjust',
              draft.sketch.pages[pageIndex],
              pageSnapshot,
              CanvasKit,
            );
            break;
          }
          case 'scaling': {
            const { origin, current, pageSnapshot, direction } =
              interactionState;

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            const originalBoundingRect = getBoundingRect(
              pageSnapshot,
              layerIds,
            )!;

            const lineLayer = Selectors.getSelectedLineLayer(state);

            if (lineLayer) {
              moveSelectedPoints(
                {
                  [lineLayer.do_objectID]: [
                    getLineDragHandleIndexForDirection(direction),
                  ],
                },
                layerIndexPaths,
                delta,
                'adjust',
                draft.sketch.pages[pageIndex],
                pageSnapshot,
                CanvasKit,
              );

              return;
            }

            const newBoundingRect = getScaledSnapBoundingRect(
              state,
              pageSnapshot,
              originalBoundingRect,
              delta,
              context.canvasSize,
              direction,
              {
                constrainProportions: Selectors.getConstrainedScaling(
                  state,
                  pageSnapshot,
                  layerIndexPaths,
                ),
                scalingOriginMode: state.keyModifiers.altKey
                  ? 'center'
                  : 'extent',
              },
            );

            const originalTransform = AffineTransform.translate(
              originalBoundingRect.x,
              originalBoundingRect.y,
            ).scale(originalBoundingRect.width, originalBoundingRect.height);

            const newTransform = AffineTransform.translate(
              newBoundingRect.x,
              newBoundingRect.y,
            ).scale(newBoundingRect.width, newBoundingRect.height);

            layerIndexPaths.forEach((indexPath) => {
              const originalLayer = Layers.access(pageSnapshot, indexPath);

              const layerTransform = getLayerTransformAtIndexPath(
                pageSnapshot,
                indexPath,
              );

              const layer = Layers.access(
                pageSnapshot,
                indexPath,
              ) as Layers.PageLayer;

              const originalBounds = createBounds(originalLayer.frame);

              const scaleTransform = AffineTransform.multiply(
                layerTransform.invert(),
                newTransform,
                originalTransform.invert(),
                layerTransform,
              );

              const min = scaleTransform.applyTo({
                x: originalBounds.minX,
                y: originalBounds.minY,
              });

              const max = scaleTransform.applyTo({
                x: originalBounds.maxX,
                y: originalBounds.maxY,
              });

              const roundedMin = { x: Math.round(min.x), y: Math.round(min.y) };
              const roundedMax = { x: Math.round(max.x), y: Math.round(max.y) };

              const width = roundedMax.x - roundedMin.x;
              const height = roundedMax.y - roundedMin.y;

              let newLayer = resizeLayerFrame(
                layer,
                createRect(roundedMin, roundedMax),
              );

              if (!Layers.isSymbolMasterOrArtboard(newLayer)) {
                newLayer = produce(newLayer, (draft) => {
                  draft.isFlippedHorizontal =
                    width < 0
                      ? !layer.isFlippedHorizontal
                      : layer.isFlippedHorizontal;

                  draft.isFlippedVertical =
                    height < 0
                      ? !layer.isFlippedVertical
                      : layer.isFlippedVertical;
                });
              }

              Layers.assign(draft.sketch.pages[pageIndex], indexPath, newLayer);
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
              scrollOrigin: '{0,0}',
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
    case 'importImage': {
      const [, images, insertAt, insertInto] = action;
      const pageIndex = getCurrentPageIndex(state);

      let parentLayer: Layers.ParentLayer | undefined;

      switch (insertInto) {
        case 'selectedArtboard': {
          const selectedLayers = Selectors.getSelectedLayers(state);

          if (
            selectedLayers.length > 0 &&
            Layers.isArtboard(selectedLayers[0])
          ) {
            parentLayer = selectedLayers[0];
          }

          break;
        }
        case 'nearestArtboard': {
          const targetLayer = state.sketch.pages[pageIndex].layers.find(
            (layer) =>
              Layers.isArtboard(layer) &&
              rectContainsPoint(layer.frame, insertAt),
          );

          if (targetLayer && Layers.isArtboard(targetLayer)) {
            parentLayer = targetLayer;
          }
        }
      }

      const layerIds = images.map(() => uuid());

      state = produce(state, (draft) => {
        zip(images, layerIds).forEach(([image, layerId]) => {
          let layer: Sketch.AnyLayer;

          if (image.extension === 'svg') {
            const { name, svgString } = image;

            layer = svgToLayer(svgString);
            layer.name = name;
            layer.do_objectID = layerId;
            layer.frame = {
              ...layer.frame,
              x: insertAt.x - layer.frame.width / 2,
              y: insertAt.y - layer.frame.height / 2,
            };
          } else {
            const { name, extension, size, data } = image;

            const _ref = `images/${uuid()}.${extension}`;

            draft.sketch.images[_ref] = data;

            layer = SketchModel.bitmap({
              do_objectID: layerId,
              name,
              image: SketchModel.fileReference({ _ref }),
              frame: SketchModel.rect({
                x: insertAt.x - size.width / 2,
                y: insertAt.y - size.height / 2,
                width: size.width,
                height: size.height,
              }),
              style: SketchModel.style({
                fills: [],
                borders: [],
                colorControls: SketchModel.colorControls({
                  isEnabled: false,
                }),
              }),
            });
          }

          draft.sketch.pages[pageIndex].layers.push(layer);
        });

        draft.selectedLayerIds = layerIds;
      });

      if (parentLayer) {
        state = moveLayer(state, layerIds, parentLayer.do_objectID, 'inside');
      }

      return state;
    }
    default:
      return state;
  }
}

export function createDrawingLayer(
  CanvasKit: CanvasKit,
  shapeType: DrawableLayerType,
  style: Sketch.Style,
  origin: Point,
  current: Point,
  pixelAlign: boolean,
  scalingOptions: ScalingOptions,
):
  | Sketch.Oval
  | Sketch.Rectangle
  | Sketch.Text
  | Sketch.Artboard
  | Sketch.Slice
  | Sketch.ShapePath {
  let rect = Selectors.getDrawnLayerRect(origin, current, scalingOptions);

  if (pixelAlign) {
    rect = insetRect(rect, 0.5);
  }

  const frame = SketchModel.rect(rect);

  switch (shapeType) {
    case 'oval':
      return SketchModel.oval({ style, frame });
    case 'rectangle':
      return SketchModel.rectangle({ style, frame });
    case 'text':
      return SketchModel.text({ frame });
    case 'artboard':
      return SketchModel.artboard({ frame });
    case 'slice':
      return SketchModel.slice({
        frame,
        exportOptions: SketchModel.exportOptions({
          exportFormats: [SketchModel.exportFormat()],
        }),
      });
    case 'line': {
      if (scalingOptions.constrainProportions) {
        const delta = {
          x: current.x - origin.x,
          y: current.y - origin.y,
        };

        if (Math.abs(delta.x) > Math.abs(delta.y) * 2) {
          current = {
            x: current.x,
            y: origin.y,
          };
        } else if (Math.abs(delta.y) > Math.abs(delta.x) * 2) {
          current = {
            x: origin.x,
            y: current.y,
          };
        } else {
          const max = Math.max(Math.abs(delta.x), Math.abs(delta.y));

          current = {
            x: origin.x + (delta.x < 0 ? -max : max),
            y: origin.y + (delta.y < 0 ? -max : max),
          };
        }
      }

      const createCurvePoint = (point: Point): DecodedCurvePoint => ({
        curveMode: Sketch.CurveMode.Straight,
        hasCurveFrom: false,
        hasCurveTo: false,
        curveFrom: point,
        curveTo: point,
        point: point,
        cornerRadius: 0,
        _class: 'curvePoint',
      });

      const decodedCurvePoints = [
        createCurvePoint(origin),
        createCurvePoint(current),
      ];

      const boundingRect = computeCurvePointBoundingRect(
        CanvasKit,
        decodedCurvePoints,
        frame,
        false,
      );

      const layer = SketchModel.shapePath({
        style: SketchModel.style({
          borders: [
            SketchModel.border({
              color: defaultBorderColor,
            }),
          ],
        }),
        frame: SketchModel.rect(boundingRect),
        points: decodedCurvePoints.map((curvePoint) =>
          encodeCurvePoint(curvePoint, boundingRect),
        ),
      });

      fixZeroLayerDimensions(layer);

      return layer;
    }
  }
}
