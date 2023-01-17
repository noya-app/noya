import {
  useApplicationState,
  useSelector,
  useWorkspace,
} from 'noya-app-state-context';
import {
  useCopyHandler,
  useLayerMenu,
  useMultipleClickCount,
  usePasteHandler,
} from 'noya-canvas';
import {
  ContextMenu,
  isLeftButtonClicked,
  isRightButtonClicked,
  mergeEventHandlers,
  SupportedCanvasUploadType,
  SupportedImageUploadType,
  SUPPORTED_CANVAS_UPLOAD_TYPES,
  SUPPORTED_IMAGE_UPLOAD_TYPES,
  usePlatformModKey,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createRect,
  Insets,
  Point,
  Size,
} from 'noya-geometry';
import { IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS } from 'noya-keymap';
import { FileDropTarget, OffsetPoint, TypedFile } from 'noya-react-utils';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { decode } from 'noya-sketch-file';
import {
  decodeCurvePoint,
  ImportedImageTarget,
  Layers,
  SelectedControlPoint,
  SelectedPoint,
  Selectors,
} from 'noya-state';
import React, {
  CSSProperties,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useGesture } from 'react-use-gesture';
import styled from 'styled-components';
import { useAutomaticCanvasSize } from '../hooks/useAutomaticCanvasSize';
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts';
import { importImageFileWithCanvasKit } from '../utils/importImageFile';
import { ZERO_INSETS } from './CanvasElement';

const InsetContainer = styled.div<{ insets: Insets; zIndex: number }>(
  ({ insets, zIndex }) => ({
    position: 'absolute',
    top: -insets.top,
    bottom: -insets.bottom,
    right: -insets.right,
    left: -insets.left,
    zIndex,
  }),
);

const HiddenInputTarget = styled.input({
  position: 'absolute',
  top: '-200px',
});

function getPoint(event: OffsetPoint): Point {
  return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
}

function isMoving(point: Point, origin: Point, zoomValue: number): boolean {
  const threshold = 2 / zoomValue;

  return (
    Math.abs(point.x - origin.x) > threshold ||
    Math.abs(point.y - origin.y) > threshold
  );
}

const Container = styled.div<{ cursor: CSSProperties['cursor'] }>(
  ({ cursor }) => ({
    flex: '1',
    position: 'relative',
    cursor,
  }),
);

interface Props {
  children: ({ size }: { size: Size }) => JSX.Element;
  insets?: Insets;
  rendererZIndex?: number;
}

export const Canvas = memo(function Canvas({
  children,
  insets: canvasInsets = ZERO_INSETS,
  rendererZIndex = 0,
}: Props) {
  const [state, dispatch] = useApplicationState();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { canvasSize, viewportSize } = useAutomaticCanvasSize({
    insets: canvasInsets,
    containerRef,
    onChangeSize: useCallback(
      (size, insets) => dispatch('setCanvasSize', size, insets),
      [dispatch],
    ),
  });

  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const platformModKey = usePlatformModKey();
  const { highlightLayer, highlightedLayer } = useWorkspace();
  const bind = useGesture({
    onWheel: ({ delta: [x, y] }) => dispatch('pan*', { x, y }),
  });
  useCanvasShortcuts();

  const { zoomValue, scrollOrigin } = meta;

  // Event coordinates are relative to (0,0), but we want them to include
  // the current page's zoom and offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) =>
      AffineTransform.scale(1 / zoomValue)
        .translate(-scrollOrigin.x, -scrollOrigin.y)
        .applyTo(point),
    [scrollOrigin, zoomValue],
  );

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const [menuItems, onSelectMenuItem] = useLayerMenu(
    selectedLayers,
    state.interactionState.type,
  );

  const { setLatestClick } = useMultipleClickCount();

  const handleMouseDown = useCallback(
    (event: React.PointerEvent) => {
      if (!state.selectedGradient) {
        inputRef.current?.focus();
      }

      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      const clickCount = setLatestClick(point);

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
          canvasInsets,
          rawPoint,
          {
            groups: event[platformModKey] ? 'childrenOnly' : 'groupOnly',
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
                shiftKey || event[platformModKey]
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
          } else if (!(shiftKey || event[platformModKey])) {
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
          } else {
            const layer = Selectors.getLayerAtPoint(
              CanvasKit,
              fontManager,
              state,
              canvasInsets,
              rawPoint,
              {
                groups: event[platformModKey] ? 'childrenOnly' : 'groupOnly',
                artboards: 'emptyOrContainedArtboardOrChildren',
                includeLockedLayers: false,
              },
            );

            if (layer) {
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
          }

          break;
        }
      }
    },
    [
      state,
      offsetEventPoint,
      setLatestClick,
      selectedLayers,
      CanvasKit,
      fontManager,
      dispatch,
      canvasInsets,
      platformModKey,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      const textSelection = Selectors.getTextSelection(state);

      switch (state.interactionState.type) {
        case 'maybeMoveGradientEllipseLength': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin, zoomValue)) {
            dispatch('interaction', ['movingGradientEllipseLength', point]);
          }

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'maybeSelectingText': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin, zoomValue)) {
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

          if (isMoving(point, origin, zoomValue)) {
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

          if (isMoving(point, origin, zoomValue)) {
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

          if (isMoving(point, origin, zoomValue)) {
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

          if (isMoving(point, origin, zoomValue)) {
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

          if (isMoving(point, origin, zoomValue)) {
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
            Selectors.getCurrentPage(state),
            canvasInsets,
            createRect(origin, current),
            {
              groups: event[platformModKey] ? 'childrenOnly' : 'groupOnly',
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
            canvasInsets,
            rawPoint,
            {
              groups: event[platformModKey] ? 'childrenOnly' : 'groupOnly',
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
      zoomValue,
      CanvasKit,
      fontManager,
      selectedLayers,
      canvasInsets,
      platformModKey,
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
            Selectors.getCurrentPage(state),
            canvasInsets,
            createRect(origin, current),
            {
              groups: event[platformModKey] ? 'childrenOnly' : 'groupOnly',
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
    [
      offsetEventPoint,
      state,
      CanvasKit,
      fontManager,
      dispatch,
      canvasInsets,
      platformModKey,
    ],
  );

  const cursor = useMemo(() => Selectors.getCursor(state), [state]);

  const onImportImages = useCallback(
    async (
      files: TypedFile<SupportedCanvasUploadType>[],
      insertTarget: ImportedImageTarget,
      offsetPoint: OffsetPoint,
    ) => {
      const rawPoint = getPoint(offsetPoint);
      const point = offsetEventPoint(rawPoint);

      const images = await Promise.all(
        files.map((file) => importImageFileWithCanvasKit(CanvasKit, file)),
      );

      const validImages = images.flatMap((image) => (image ? [image] : []));

      dispatch('importImage', validImages, point, insertTarget);
    },
    [CanvasKit, dispatch, offsetEventPoint],
  );

  usePasteHandler<SupportedImageUploadType>({
    supportedFileTypes: SUPPORTED_IMAGE_UPLOAD_TYPES,
    onPasteImages: useCallback(
      (files) => {
        const offsetSize = viewportSize ?? { width: 0, height: 0 };
        const insertPoint = {
          offsetX: offsetSize.width / 2,
          offsetY: offsetSize.height / 2,
        };
        onImportImages(files, 'selectedArtboard', insertPoint);
      },
      [viewportSize, onImportImages],
    ),
    onPasteLayers: useCallback(
      (layers) => dispatch('addLayer', layers),
      [dispatch],
    ),
  });

  useCopyHandler();

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

  const { onBeforeInput, ...mergedHandlers } = mergeEventHandlers(bind(), {
    onPointerDown: handleMouseDown,
    onPointerMove: handleMouseMove,
    onPointerUp: handleMouseUp,
  });

  return (
    <FileDropTarget<SupportedCanvasUploadType>
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
          {...mergedHandlers}
          tabIndex={0}
          onFocus={() => inputRef.current?.focus()}
        >
          <HiddenInputTarget
            id="hidden-canvas-input"
            className={IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS}
            ref={inputRef}
            type="text"
          />
          <InsetContainer insets={canvasInsets} zIndex={rendererZIndex}>
            {canvasSize && children({ size: canvasSize })}
          </InsetContainer>
        </Container>
      </ContextMenu>
    </FileDropTarget>
  );
});
