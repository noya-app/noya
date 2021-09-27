import {
  useApplicationState,
  useSelector,
  useWorkspace,
} from 'noya-app-state-context';
import {
  ContextMenu,
  isLeftButtonClicked,
  isRightButtonClicked,
  mergeEventHandlers,
  SupportedCanvasUploadType,
  SupportedImageUploadType,
  SUPPORTED_CANVAS_UPLOAD_TYPES,
  SUPPORTED_IMAGE_UPLOAD_TYPES,
  useModKey,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { AffineTransform, createRect, Insets, Point } from 'noya-geometry';
import {
  FALLTHROUGH,
  IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS,
  useKeyboardShortcuts,
} from 'noya-keymap';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { decode } from 'noya-sketch-file';
import {
  ApplicationState,
  CompassDirection,
  decodeCurvePoint,
  getCurrentPage,
  getSelectedLineLayer,
  ImportedImageTarget,
  InsertedImage,
  Layers,
  SelectedControlPoint,
  SelectedPoint,
  Selectors,
} from 'noya-state';
import { getFileExtensionForType } from 'noya-utils';
import {
  CSSProperties,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useGesture } from 'react-use-gesture';
import styled, { useTheme } from 'styled-components';
import DropTarget, { TypedFile } from '../components/FileDropTarget';
import { useArrowKeyShortcuts } from '../hooks/useArrowKeyShortcuts';
import { useImagePasteHandler } from '../hooks/useFilePasteHandler';
import useLayerMenu from '../hooks/useLayerMenu';
import { useMultipleClickCount } from '../hooks/useMultipleClickCount';
import { useSize } from '../hooks/useSize';
import CanvasKitRenderer from './renderer/CanvasKitRenderer';
// import SVGRenderer from './renderer/SVGRenderer';

const InsetContainer = styled.div<{ insets: Insets }>(({ insets }) => ({
  position: 'absolute',
  top: -insets.top,
  bottom: -insets.bottom,
  right: -insets.right,
  left: -insets.left,
  zIndex: -1,
}));

const HiddenInputTarget = styled.input({
  position: 'absolute',
  top: '-200px',
});

function getCursorForDirection(
  direction: CompassDirection,
  state: ApplicationState,
): CSSProperties['cursor'] {
  if (getSelectedLineLayer(state)) return 'move';

  switch (direction) {
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
  }
}

export type OffsetPoint = {
  offsetX: number;
  offsetY: number;
};

function getPoint(event: OffsetPoint): Point {
  return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
}

function isMoving(point: Point, origin: Point): boolean {
  return Math.abs(point.x - origin.x) > 2 || Math.abs(point.y - origin.y) > 2;
}
const Container = styled.div<{ cursor: CSSProperties['cursor'] }>(
  ({ cursor }) => ({
    flex: '1',
    position: 'relative',
    cursor,
  }),
);

export default memo(function Canvas() {
  const theme = useTheme();
  const {
    sizes: {
      sidebarWidth,
      toolbar: { height: toolbarHeight },
    },
  } = theme;
  const [state, dispatch] = useApplicationState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const containerSize = useSize(containerRef);
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const modKey = useModKey();
  const {
    setCanvasSize,
    highlightLayer,
    highlightedLayer,
    isolatedLayer,
    canvasSize,
  } = useWorkspace();
  const bind = useGesture({
    onWheel: ({ delta: [x, y] }) => {
      dispatch('pan', { x, y });
    },
  });

  useLayoutEffect(() => {
    if (!isolatedLayer) return;

    dispatch('zoomToFit', { type: 'layer', value: isolatedLayer });
  }, [canvasSize, isolatedLayer, dispatch]);

  const isPanning =
    state.interactionState.type === 'panMode' ||
    state.interactionState.type === 'maybePan' ||
    state.interactionState.type === 'panning';

  const isEditingText = Selectors.getIsEditingText(state.interactionState.type);

  useArrowKeyShortcuts();

  const handleDeleteKey = () => {
    if (isEditingText) return FALLTHROUGH;

    if (state.selectedGradient) {
      dispatch('deleteStopToGradient');
    } else {
      dispatch('deleteLayer', state.selectedLayerIds);
    }
  };

  useKeyboardShortcuts({
    Backspace: handleDeleteKey,
    Delete: handleDeleteKey,
    Escape: () => dispatch('interaction', ['reset']),
    Shift: () => dispatch('setKeyModifier', 'shiftKey', true),
    Alt: () => dispatch('setKeyModifier', 'altKey', true),
    Space: () => {
      if (isEditingText) return FALLTHROUGH;

      if (state.interactionState.type !== 'none') return;

      dispatch('interaction', ['enablePanMode']);
    },
    Enter: () => {
      if (isEditingText) return FALLTHROUGH;

      switch (state.interactionState.type) {
        case 'editPath': {
          dispatch('interaction', ['reset']);

          break;
        }
        case 'none': {
          const selectedLayers = Selectors.getSelectedLayers(state);

          if (selectedLayers.length > 0) {
            const firstLayer = selectedLayers[0];

            if (Layers.isTextLayer(firstLayer)) {
              dispatch('selectLayer', firstLayer.do_objectID);
              dispatch('interaction', [
                'editingText',
                firstLayer.do_objectID,
                {
                  anchor: 0,
                  head: firstLayer.attributedString.string.length,
                },
              ]);
            } else if (Layers.isPointsLayer(firstLayer)) {
              dispatch(
                'selectLayer',
                selectedLayers
                  .filter(Layers.isPointsLayer)
                  .map((layer) => layer.do_objectID),
              );
              dispatch('interaction', ['editPath']);
            }

            break;
          }
        }
      }
    },
  });

  useKeyboardShortcuts(
    {
      Space: () => {
        if (!isPanning) return;

        dispatch('interaction', ['reset']);
      },
      Shift: () => dispatch('setKeyModifier', 'shiftKey', false),
      Alt: () => dispatch('setKeyModifier', 'altKey', false),
    },
    { eventName: 'keyup' },
  );

  const insets = useMemo(
    () => ({
      left: sidebarWidth,
      right: sidebarWidth,
      top: toolbarHeight,
      bottom: 0,
    }),
    [sidebarWidth, toolbarHeight],
  );

  // Update the canvas size whenever the window is resized
  useLayoutEffect(() => {
    if (!containerSize) return;

    setCanvasSize(containerSize, insets);
  }, [insets, setCanvasSize, containerSize]);

  const canvasSizeWithInsets = useMemo(
    () =>
      containerSize && containerSize.width > 0 && containerSize.height > 0
        ? {
            width: containerSize.width + insets.left + insets.right,
            height: containerSize.height + insets.top + insets.bottom,
          }
        : undefined,
    [containerSize, insets.bottom, insets.left, insets.right, insets.top],
  );

  // Event coordinates are relative to (0,0), but we want them to include
  // the current page's zoom and offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) =>
      AffineTransform.scale(1 / meta.zoomValue)
        .translate(-meta.scrollOrigin.x, -meta.scrollOrigin.y)
        .applyTo(point),
    [meta],
  );

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const [menuItems, onSelectMenuItem] = useLayerMenu(
    selectedLayers,
    state.interactionState.type,
  );

  const getClickCount = useMultipleClickCount();

  const handleMouseDown = useCallback(
    (event: React.PointerEvent) => {
      if (!state.selectedGradient) {
        inputRef.current?.focus();
      }

      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      const clickCount = getClickCount(point);

      if (clickCount >= 2) {
        if (selectedLayers.length === 0) return;

        const layer = selectedLayers[0];

        if (!Layers.isTextLayer(layer)) return;

        const characterIndex = Selectors.getCharacterIndexAtPoint(
          CanvasKit,
          fontManager,
          state,
          layer.do_objectID,
          point,
          'bounded',
        );

        if (state.interactionState.type === 'none') {
          dispatch('interaction', [
            'editingText',
            layer.do_objectID,
            { anchor: 0, head: layer.attributedString.string.length },
          ]);
        }

        if (characterIndex === undefined) {
          dispatch('selectAllText', layer.do_objectID);
        } else {
          dispatch(
            'selectContainingText',
            layer.do_objectID,
            characterIndex,
            clickCount % 2 === 0 ? 'word' : 'line',
          );
        }

        return;
      }

      if (isRightButtonClicked(event)) {
        const layer = Selectors.getLayerAtPoint(
          CanvasKit,
          fontManager,
          state,
          insets,
          rawPoint,
          {
            groups: event[modKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        if (!layer) {
          dispatch('selectLayer', undefined);
        } else if (!state.selectedLayerIds.includes(layer.do_objectID)) {
          dispatch('selectLayer', layer.do_objectID);
        }

        return;
      }

      if (!isLeftButtonClicked(event)) return;

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

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'drawingShapePath': {
          dispatch('addShapePathLayer', point);
          dispatch('interaction', ['maybeConvertCurveMode', point]);
          break;
        }
        case 'editBitmap': {
          dispatch('setPixel', point, state.interactionState.currentColor);
          dispatch('interaction', ['startDrawingPixels']);
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
              const alreadySelected = state.selectedPointLists[
                selectedPoint[0]
              ]?.includes(selectedPoint[1]);

              dispatch(
                'selectPoint',
                selectedPoint,
                shiftKey || event[modKey]
                  ? alreadySelected
                    ? 'difference'
                    : 'intersection'
                  : 'replace',
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
          } else if (!(shiftKey || event[modKey])) {
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
              groups: event[modKey] ? 'childrenOnly' : 'groupOnly',
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
              if (event.shiftKey && state.selectedLayerIds.length !== 1) {
                dispatch('selectLayer', layer.do_objectID, 'difference');
              }
            } else {
              dispatch(
                'selectLayer',
                layer.do_objectID,
                event.shiftKey ? 'intersection' : 'replace',
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
    [
      state,
      offsetEventPoint,
      getClickCount,
      selectedLayers,
      CanvasKit,
      fontManager,
      dispatch,
      insets,
      modKey,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      const textSelection = Selectors.getTextSelection(state);

      switch (state.interactionState.type) {
        case 'editBitmap': {
          if (state.interactionState.editBitmapState === 'notStarted') return;

          dispatch('setPixel', point, state.interactionState.currentColor);
          break;
        }
        case 'maybeMoveGradientEllipseLength': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingGradientEllipseLength', point]);
          }

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'maybeSelectingText': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['selectingText', point]);
          }

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'moveGradientEllipseLength': {
          dispatch('interaction', ['movingGradientEllipseLength', point]);
          event.preventDefault();
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

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'moveGradientStop': {
          dispatch('interaction', ['movingGradientStop', point]);
          event.preventDefault();
          break;
        }
        case 'insert':
          dispatch('interaction', [
            state.interactionState.type,
            state.interactionState.layerType,
            point,
          ]);
          break;
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

          event.preventDefault();
          break;
        }
        case 'panning': {
          dispatch('interaction', ['updatePanning', rawPoint]);

          event.preventDefault();
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

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'maybeMovePoint': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingPoint', origin, point]);
          }

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'movingPoint': {
          const { origin } = state.interactionState;

          dispatch('interaction', ['updateMovingPoint', origin, point]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
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

          event.preventDefault();
          containerRef.current?.setPointerCapture(event.pointerId);
          break;
        }
        case 'maybeMoveControlPoint': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingControlPoint', origin, point]);
          }

          event.preventDefault();
          containerRef.current?.setPointerCapture(event.pointerId);
          break;
        }
        case 'movingControlPoint': {
          const { origin } = state.interactionState;

          dispatch('interaction', ['updateMovingControlPoint', origin, point]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

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

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          break;
        }
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          break;
        }
        case 'marquee': {
          dispatch('interaction', ['updateMarquee', rawPoint]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          const { origin, current } = state.interactionState;

          const layers = Selectors.getLayersInRect(
            state,
            getCurrentPage(state),
            insets,
            createRect(origin, current),
            {
              groups: event[modKey] ? 'childrenOnly' : 'groupOnly',
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
              groups: event[modKey] ? 'childrenOnly' : 'groupOnly',
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
                    isMeasured: event.altKey,
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
      offsetEventPoint,
      state,
      dispatch,
      CanvasKit,
      fontManager,
      selectedLayers,
      insets,
      modKey,
      highlightedLayer?.id,
      highlightLayer,
    ],
  );

  const handleMouseUp = useCallback(
    (event) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      const textSelection = Selectors.getTextSelection(state);

      switch (state.interactionState.type) {
        case 'editBitmap': {
          if (state.interactionState.editBitmapState === 'notStarted') return;

          dispatch('setPixel', point, state.interactionState.currentColor);
          dispatch('interaction', ['endDrawingPixels']);
          break;
        }
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

          containerRef.current?.releasePointerCapture(event.pointerId);
          break;
        }
        case 'selectingText':
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

          containerRef.current?.releasePointerCapture(event.pointerId);
          break;
        case 'maybePan':
          dispatch('interaction', ['enablePanMode']);

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        case 'panning': {
          dispatch('interaction', ['updatePanning', rawPoint]);
          dispatch('interaction', ['enablePanMode']);

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          dispatch('addDrawnLayer');

          containerRef.current?.releasePointerCapture(event.pointerId);

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
              groups: event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'maybeMove':
        case 'maybeScale':
        case 'moveGradientStop':
        case 'maybeMoveGradientStop':
        case 'maybeMoveGradientEllipseLength':
        case 'moveGradientEllipseLength': {
          dispatch('interaction', ['reset']);

          containerRef.current?.releasePointerCapture(event.pointerId);

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

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'maybeMoveControlPoint':
        case 'movingControlPoint':
        case 'maybeMovePoint':
        case 'movingPoint': {
          dispatch('interaction', ['resetEditPath', point]);
          containerRef.current?.releasePointerCapture(event.pointerId);
          break;
        }
        case 'maybeConvertCurveMode':
          dispatch('interaction', ['resetEditPath', point]);
          break;
      }
    },
    [offsetEventPoint, state, CanvasKit, fontManager, dispatch, insets, modKey],
  );

  const handleDirection =
    state.interactionState.type === 'hoverHandle' ||
    state.interactionState.type === 'maybeScale' ||
    state.interactionState.type === 'scaling'
      ? state.interactionState.direction
      : undefined;

  const cursor = useMemo((): CSSProperties['cursor'] => {
    switch (state.interactionState.type) {
      case 'panning':
      case 'maybePan':
        return 'grabbing';
      case 'panMode':
        return 'grab';
      case 'insert':
        return 'crosshair';
      case 'drawingShapePath':
        return 'crosshair';
      case 'maybeScale':
      case 'scaling':
      case 'hoverHandle':
        if (handleDirection) {
          return getCursorForDirection(handleDirection, state);
        }
        return 'default';
      case 'editPath': {
        const { point } = state.interactionState;

        return point
          ? Selectors.getCursorForEditPathMode(state, point)
          : 'default';
      }
      case 'maybeMoveControlPoint':
      case 'maybeMovePoint':
      case 'movingControlPoint':
      case 'movingPoint':
        return 'move';
      case 'editingText':
      case 'selectingText':
      case 'maybeSelectingText':
        return 'text';
      default:
        return 'default';
    }
  }, [state, handleDirection]);

  const onImportImages = useCallback(
    async (
      files: TypedFile<SupportedCanvasUploadType>[],
      insertTarget: ImportedImageTarget,
      offsetPoint: OffsetPoint,
    ) => {
      const rawPoint = getPoint(offsetPoint);
      const point = offsetEventPoint(rawPoint);

      const images = await Promise.all(
        files.map(async (file): Promise<InsertedImage | void> => {
          if (file.type === 'image/svg+xml') {
            const svgString = await file.text();

            return {
              name: file.name.replace(/\.svg$/, ''),
              extension: 'svg',
              svgString,
            };
          } else {
            const data = await file.arrayBuffer();
            const decodedImage = CanvasKit.MakeImageFromEncoded(data);

            if (!decodedImage) return;

            const size = {
              width: decodedImage.width(),
              height: decodedImage.height(),
            };

            if (file.type === '') return;

            const extension = getFileExtensionForType(file.type);

            return {
              name: file.name.replace(new RegExp(`\\.${extension}$`), ''),
              extension,
              size,
              data,
            };
          }
        }),
      );

      const validImages = images.flatMap((image) => (image ? [image] : []));

      dispatch('importImage', validImages, point, insertTarget);
    },
    [CanvasKit, dispatch, offsetEventPoint],
  );

  useImagePasteHandler<SupportedImageUploadType>({
    supportedFileTypes: SUPPORTED_IMAGE_UPLOAD_TYPES,
    canvasSize: containerSize,
    onPasteImages: useCallback(
      (files, point) => onImportImages(files, 'selectedArtboard', point),
      [onImportImages],
    ),
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;

    if (!input) return;

    const handler = (event: InputEvent) => {
      if (typeof event.data === 'string') {
        dispatch('insertText', event.data);
      } else {
        switch (event.inputType) {
          case 'insertLineBreak':
            dispatch('insertText', '\n');
            break;
          // Delete
          case 'deleteContent':
          case 'deleteContentForward':
          case 'deleteContentBackward':
          case 'deleteEntireSoftLine':
          case 'deleteHardLineBackward':
          case 'deleteSoftLineBackward':
          case 'deleteHardLineForward':
          case 'deleteSoftLineForward':
          case 'deleteWordBackward':
          case 'deleteWordForward':
            dispatch(
              'deleteText',
              ...Selectors.getDeletionParametersForInputEvent(event.inputType),
            );
        }
      }
    };

    input.addEventListener('beforeinput', handler);

    return () => input.removeEventListener('beforeinput', handler);
  }, [dispatch]);

  const onImportSketchFile = useCallback(
    async (file: TypedFile<SupportedCanvasUploadType>) => {
      const answer = window.confirm(
        'Opening a new file will replace your current file. Are you sure?',
      );
      if (answer === false) return;

      const data = await file.arrayBuffer();
      const sketch = await decode(data);

      dispatch('setFile', sketch);
    },
    [dispatch],
  );

  return (
    <DropTarget<SupportedCanvasUploadType>
      supportedFileTypes={SUPPORTED_CANVAS_UPLOAD_TYPES}
      onDropFiles={useCallback(
        (file, point) => {
          const sketchFileIndex = file.findIndex(({ name }) =>
            name.endsWith('.sketch'),
          );

          if (sketchFileIndex !== -1) {
            onImportSketchFile(file[sketchFileIndex]);
          } else {
            onImportImages(file, 'nearestArtboard', point);
          }
        },
        [onImportImages, onImportSketchFile],
      )}
    >
      <ContextMenu items={menuItems} onSelect={onSelectMenuItem}>
        <Container
          id="canvas-container"
          ref={containerRef}
          cursor={cursor}
          {...mergeEventHandlers(bind(), {
            onPointerDown: handleMouseDown,
            onPointerMove: handleMouseMove,
            onPointerUp: handleMouseUp,
          })}
          tabIndex={0}
          onFocus={() => inputRef.current?.focus()}
        >
          <HiddenInputTarget
            id="hidden-canvas-input"
            className={IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS}
            ref={inputRef}
            type="text"
          />
          <InsetContainer insets={insets}>
            {canvasSizeWithInsets && (
              // <SVGRenderer size={canvasSizeWithInsets}>
              //   <SketchFileRenderer />
              // </SVGRenderer>
              <CanvasKitRenderer size={canvasSizeWithInsets} />
            )}
          </InsetContainer>
        </Container>
      </ContextMenu>
    </DropTarget>
  );
});
