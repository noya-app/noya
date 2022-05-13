import React, { useCallback, useMemo } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { GestureDetector, ManualGesture } from 'react-native-gesture-handler';
import styled from 'styled-components';

import {
  useSelector,
  useWorkspace,
  useApplicationState,
} from 'noya-app-state-context';
import { AffineTransform, Point, createRect } from 'noya-geometry';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { ContextMenu } from 'noya-designsystem';
import { useKeyEvent } from 'noya-keymap';
import Sketch from 'noya-file-format';
import {
  Layers,
  Selectors,
  SelectedPoint,
  getCurrentPage,
  decodeCurvePoint,
  SelectedControlPoint,
} from 'noya-state';
import {
  useLayerMenu,
  GestureState,
  CanvasTouchEvent,
  useCanvasGestures,
  useArrowKeyShortcuts,
} from 'noya-workspace-ui';
import CanvasRenderer from './CanvasRenderer';

function isMoving(point: Point, origin: Point): boolean {
  return Math.abs(point.x - origin.x) > 2 || Math.abs(point.y - origin.y) > 2;
}

const Canvas: React.FC<{}> = () => {
  const [state, dispatch] = useApplicationState();
  const { setCanvasSize, highlightLayer, highlightedLayer } = useWorkspace();
  const fontManager = useFontManager();
  const CanvasKit = useCanvasKit();

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const meta = useSelector(Selectors.getCurrentPageMetadata);

  const [menuItems, onSelectMenuItem] = useLayerMenu(
    selectedLayers,
    state.interactionState.type,
  );

  const insets = useMemo(
    () => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }),
    [],
  );

  useArrowKeyShortcuts();
  useKeyEvent();

  // Event coordinates are relative to (0,0), but we want them to include
  // the current page's zoom and offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) =>
      AffineTransform.scale(1 / meta.zoomValue)
        .translate(-meta.scrollOrigin.x, -meta.scrollOrigin.y)
        .applyTo(point),
    [meta],
  );

  const onTouchStart = useCallback(
    ({ point: rawPoint }: CanvasTouchEvent) => {
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            'startDrawing',
            state.interactionState.layerType,
            point,
          ]);
          break;
        }
        case 'insertingSymbol': {
          dispatch('addSymbolLayer', state.interactionState.symbolID, point);
          dispatch('interaction', ['reset']);
          break;
        }
        case 'panMode': {
          dispatch('interaction', ['maybePan', rawPoint]);
          break;
        }
        case 'drawingShapePath': {
          dispatch('addShapePathLayer', point);
          dispatch('interaction', ['maybeConvertCurveMode', point]);
          break;
        }
        case 'editPath': {
          const { shiftKey } = state.keyModifiers;
          let selectedPoint: SelectedPoint | undefined = undefined;
          let selectedControlPoint: SelectedControlPoint | undefined;

          const boundingRects = Selectors.getBoundingRectMap(
            Selectors.getCurrentPage(state),
            state.selectedLayerIds,
            { groups: 'childrenOnly' },
          );

          const selectedPointsLayers = Selectors.getSelectedLayers(
            state,
          ).filter(Layers.isPointsLayer);

          selectedPointsLayers.forEach((layer) => {
            const boundingRect = boundingRects[layer.do_objectID];
            layer.points.forEach((curvePoint, index) => {
              const decodedPoint = decodeCurvePoint(curvePoint, boundingRect);

              if (Selectors.isPointInRange(decodedPoint.point, point)) {
                selectedPoint = [layer.do_objectID, index];
              } else if (
                Selectors.isPointInRange(decodedPoint.curveTo, point)
              ) {
                selectedControlPoint = {
                  layerId: layer.do_objectID,
                  pointIndex: index,
                  controlPointType: 'curveTo',
                };
              } else if (
                Selectors.isPointInRange(decodedPoint.curveFrom, point)
              ) {
                selectedControlPoint = {
                  layerId: layer.do_objectID,
                  pointIndex: index,
                  controlPointType: 'curveFrom',
                };
              }
            });
          });

          const indexPathOfOpenShapeLayer =
            Selectors.getIndexPathOfOpenShapeLayer(state);

          if (selectedPoint) {
            if (Selectors.canClosePath(state, selectedPoint) && !shiftKey) {
              dispatch('setIsClosed', true);
              dispatch('selectPoint', selectedPoint);
            } else {
              // const alreadySelected = state.selectedPointLists[
              //   selectedPoint[0]
              // ]?.includes(selectedPoint[1]);

              dispatch(
                'selectPoint',
                selectedPoint,
                'replace',
                // shiftKey || event[modKey]
                //   ? alreadySelected
                //     ? 'difference'
                //     : 'intersection'
                //   : 'replace',
              );
              dispatch('interaction', ['maybeMovePoint', point]);
            }
          } else if (selectedControlPoint) {
            dispatch(
              'selectControlPoint',
              selectedControlPoint.layerId,
              selectedControlPoint.pointIndex,
              selectedControlPoint.controlPointType,
            );
            dispatch('interaction', ['maybeMoveControlPoint', point]);
          } else if (
            selectedPointsLayers.some((layer) =>
              Selectors.layerPathContainsPoint(CanvasKit, layer, point),
            )
          ) {
            dispatch('insertPointInPath', point);
          } else if (indexPathOfOpenShapeLayer) {
            dispatch('addPointToPath', point);
            dispatch('interaction', ['maybeConvertCurveMode', point]);
            // } else if (!(shiftKey || event[modKey])) {
            //   dispatch('interaction', ['reset']);
            // }
          } else {
            dispatch('interaction', ['reset']);
          }
          break;
        }
        case 'hoverHandle':
        case 'editingText':
        case 'none': {
          const characterIndex =
            Selectors.getCharacterIndexAtPointInSelectedLayer(
              CanvasKit,
              fontManager,
              state,
              point,
              'bounded',
            );

          if (characterIndex !== undefined) {
            dispatch('setTextSelection', {
              anchor: characterIndex,
              head: characterIndex,
            });
            dispatch('interaction', ['maybeSelectText', point]);
            return;
          }

          if (state.selectedLayerIds.length > 0) {
            const direction = Selectors.getScaleDirectionAtPoint(state, point);

            if (direction && !state.selectedGradient) {
              dispatch('interaction', ['maybeScale', point, direction]);

              return;
            }
          }

          const layer = Selectors.getLayerAtPoint(
            CanvasKit,
            fontManager,
            state,
            insets,
            rawPoint,
            {
              groups: 'groupAndChildren', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          const selectedGradientStopIndex =
            Selectors.getGradientStopIndexAtPoint(state, point);

          if (state.selectedGradient && selectedGradientStopIndex !== -1) {
            dispatch('setSelectedGradientStopIndex', selectedGradientStopIndex);

            dispatch('interaction', ['maybeMoveGradientStop', point]);
          } else if (
            state.selectedGradient &&
            Selectors.isPointerOnGradientLine(state, point)
          ) {
            dispatch('addStopToGradient', point);
          } else if (
            state.selectedGradient &&
            Selectors.isPointerOnGradientEllipseEditor(state, point)
          ) {
            dispatch('interaction', ['maybeMoveGradientEllipseLength', point]);
          } else if (layer) {
            if (state.selectedLayerIds.includes(layer.do_objectID)) {
              // if (event.shiftKey && state.selectedLayerIds.length !== 1) {
              // dispatch('selectLayer', layer.do_objectID, 'difference');
              // }
            } else {
              dispatch(
                'selectLayer',
                layer.do_objectID,
                'replace',
                // event.shiftKey ? 'intersection' : 'replace',
              );
            }

            dispatch('interaction', ['maybeMove', point]);
          } else {
            dispatch('selectLayer', undefined);
            dispatch('interaction', ['startMarquee', rawPoint]);
          }

          break;
        }
      }
    },
    [offsetEventPoint, CanvasKit, fontManager, state, dispatch, insets],
  );

  const onTouchUpdate = useCallback(
    ({
      point: rawPoint,
      delta,
      scale,
      scaleTo,
      state: gestureState,
    }: CanvasTouchEvent) => {
      const point = offsetEventPoint(rawPoint);

      if (gestureState === GestureState.Canvas) {
        dispatch('panAndZoom*', { scale, scaleTo, delta });
        return;
      }

      const textSelection = Selectors.getTextSelection(state);

      switch (state.interactionState.type) {
        case 'maybeMoveGradientEllipseLength': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingGradientEllipseLength', point]);
          }
          break;
        }
        case 'maybeSelectingText': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['selectingText', point]);
          }

          break;
        }
        case 'moveGradientEllipseLength': {
          dispatch('interaction', ['movingGradientEllipseLength', point]);
          break;
        }
        case 'selectingText': {
          if (!textSelection) return;

          const characterIndex =
            Selectors.getCharacterIndexAtPointInSelectedLayer(
              CanvasKit,
              fontManager,
              state,
              point,
              'unbounded',
            );

          if (characterIndex !== undefined) {
            dispatch('setTextSelection', {
              anchor: textSelection.range.anchor,
              head: characterIndex,
            });
            return;
          }
          break;
        }
        case 'maybeMoveGradientStop': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingGradientStop', point]);
          }
          break;
        }
        case 'moveGradientStop': {
          dispatch('interaction', ['movingGradientStop', point]);
          break;
        }
        case 'insert': {
          dispatch('interaction', [
            state.interactionState.type,
            state.interactionState.layerType,
            point,
          ]);
          break;
        }
        case 'insertingSymbol': {
          dispatch('interaction', [
            'insertingSymbol',
            state.interactionState.symbolID,
            point,
          ]);
          break;
        }
        case 'editPath': {
          dispatch('interaction', ['resetEditPath', point]);
          break;
        }
        case 'drawingShapePath': {
          dispatch('interaction', ['drawingShapePath', point]);
          break;
        }
        case 'maybePan': {
          dispatch('interaction', ['startPanning', rawPoint]);
          break;
        }
        case 'panning': {
          dispatch('interaction', ['updatePanning', rawPoint]);
          break;
        }
        case 'maybeMove':
        case 'maybeScale': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', [
              state.interactionState.type === 'maybeMove'
                ? 'updateMoving'
                : 'updateScaling',
              point,
            ]);
          }

          break;
        }
        case 'maybeMovePoint': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingPoint', origin, point]);
          }
          break;
        }
        case 'movingPoint': {
          const { origin } = state.interactionState;

          dispatch('interaction', ['updateMovingPoint', origin, point]);
          break;
        }
        case 'maybeConvertCurveMode': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('setPointCurveMode', Sketch.CurveMode.Mirrored);
            dispatch(
              'selectControlPoint',
              selectedLayers[0].do_objectID,
              0,
              'curveFrom',
            );
            dispatch('interaction', ['maybeMoveControlPoint', origin]);
            dispatch('interaction', ['movingControlPoint', origin, point]);
          }
          break;
        }
        case 'maybeMoveControlPoint': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingControlPoint', origin, point]);
          }
          break;
        }
        case 'movingControlPoint': {
          const { origin } = state.interactionState;

          dispatch('interaction', ['updateMovingControlPoint', origin, point]);

          break;
        }
        case 'moving':
        case 'scaling': {
          dispatch('interaction', [
            state.interactionState.type === 'moving'
              ? 'updateMoving'
              : 'updateScaling',
            point,
          ]);

          break;
        }
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          break;
        }
        case 'marquee': {
          dispatch('interaction', ['updateMarquee', rawPoint]);

          const { origin, current } = state.interactionState;

          const layers = Selectors.getLayersInRect(
            state,
            getCurrentPage(state),
            insets,
            createRect(origin, current),
            {
              groups: 'groupOnly', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          break;
        }
        case 'hoverHandle': {
          const direction = Selectors.getScaleDirectionAtPoint(state, point);

          if (direction) {
            if (direction !== state.interactionState.direction) {
              dispatch('interaction', ['hoverHandle', direction]);
            }
          } else {
            dispatch('interaction', ['reset']);
          }

          break;
        }
        case 'none': {
          const layer = Selectors.getLayerAtPoint(
            CanvasKit,
            fontManager,
            state,
            insets,
            rawPoint,
            {
              groups: 'groupOnly', //event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          // For perf, check that we actually need to update the highlight.
          // This gets called on every mouse movement.
          if (highlightedLayer?.id !== layer?.do_objectID) {
            highlightLayer(
              layer
                ? {
                    id: layer.do_objectID,
                    precedence: 'belowSelection',
                    isMeasured: false, //event.altKey,
                  }
                : undefined,
            );
          }

          if (state.selectedLayerIds.length > 0) {
            const direction = Selectors.getScaleDirectionAtPoint(state, point);

            if (direction && !state.selectedGradient) {
              dispatch('interaction', ['hoverHandle', direction]);

              return;
            }
            return;
          }
          break;
        }
      }
    },
    [
      state,
      insets,
      dispatch,
      CanvasKit,
      fontManager,
      highlightLayer,
      selectedLayers,
      highlightedLayer,
      offsetEventPoint,
    ],
  );

  const onTouchEnd = useCallback(
    ({ point: rawPoint }: CanvasTouchEvent) => {
      const point = offsetEventPoint(rawPoint);

      const textSelection = Selectors.getTextSelection(state);

      switch (state.interactionState.type) {
        case 'maybeSelectingText': {
          if (!textSelection) {
            dispatch('interaction', ['reset']);
            return;
          }

          dispatch('interaction', [
            'editingText',
            textSelection.layerId,
            textSelection.range,
          ]);

          break;
        }

        case 'selectingText': {
          if (!textSelection) {
            dispatch('interaction', ['reset']);
            return;
          }

          const characterIndex =
            Selectors.getCharacterIndexAtPointInSelectedLayer(
              CanvasKit,
              fontManager,
              state,
              point,
              'bounded',
            );

          dispatch('interaction', [
            'editingText',
            textSelection.layerId,
            textSelection.range,
          ]);

          if (characterIndex !== undefined) {
            dispatch('setTextSelection', {
              anchor: textSelection.range.anchor,
              head: characterIndex,
            });
          }

          break;
        }
        case 'maybePan': {
          dispatch('interaction', ['enablePanMode']);

          break;
        }
        case 'panning': {
          dispatch('interaction', ['updatePanning', rawPoint]);
          dispatch('interaction', ['enablePanMode']);

          break;
        }
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          dispatch('addDrawnLayer');
          break;
        }
        case 'marquee': {
          dispatch('interaction', ['reset']);

          const { origin, current } = state.interactionState;

          const layers = Selectors.getLayersInRect(
            state,
            getCurrentPage(state),
            insets,
            createRect(origin, current),
            {
              groups: 'groupOnly', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          break;
        }
        case 'maybeMove':
        case 'maybeScale':
        case 'moveGradientStop':
        case 'maybeMoveGradientStop':
        case 'maybeMoveGradientEllipseLength':
        case 'moveGradientEllipseLength': {
          dispatch('interaction', ['reset']);

          break;
        }
        case 'moving':
        case 'scaling': {
          dispatch('interaction', [
            state.interactionState.type === 'moving'
              ? 'updateMoving'
              : 'updateScaling',
            point,
          ]);

          if (state.interactionState.type === 'moving')
            dispatch('moveLayersIntoParentAtPoint', point);

          dispatch('interaction', ['reset']);

          break;
        }
        case 'maybeMoveControlPoint':
        case 'movingControlPoint':
        case 'maybeMovePoint':
        case 'movingPoint': {
          dispatch('interaction', ['resetEditPath', point]);
          break;
        }
        case 'maybeConvertCurveMode': {
          dispatch('interaction', ['resetEditPath', point]);
          break;
        }
      }
    },
    [offsetEventPoint, state, dispatch, insets, CanvasKit, fontManager],
  );

  const gestures = useCanvasGestures(
    onTouchStart,
    onTouchUpdate,
    onTouchEnd,
  ) as unknown as ManualGesture;

  const onCanvasLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setCanvasSize({ width, height }, insets);
    },
    [setCanvasSize, insets],
  );

  return (
    <ContextMenu items={menuItems} onSelect={onSelectMenuItem}>
      <GestureDetector gesture={gestures}>
        <CanvasWrapper onLayout={onCanvasLayout}>
          <CanvasRenderer />
        </CanvasWrapper>
      </GestureDetector>
    </ContextMenu>
  );
};

export default React.memo(Canvas);

const CanvasWrapper = styled(View)({
  flex: 1,
});
