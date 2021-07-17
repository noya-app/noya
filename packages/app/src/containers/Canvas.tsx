import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  useApplicationState,
  useSelector,
  useWorkspace,
} from 'noya-app-state-context';
import {
  ContextMenu,
  mergeEventHandlers,
  SupportedImageUploadType,
  SUPPORTED_IMAGE_UPLOAD_TYPES,
} from 'noya-designsystem';
import { createRect, Insets } from 'noya-geometry';
import { useKeyboardShortcuts } from 'noya-keymap';
import { useCanvasKit } from 'noya-renderer';
import {
  ApplicationState,
  CompassDirection,
  decodeCurvePoint,
  getSelectedLineLayer,
  Layers,
  Point,
  SelectedControlPoint,
  SelectedPoint,
  Selectors,
  ShapeType,
} from 'noya-state';
import { getFileExtensionForType, uuid } from 'noya-utils';
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
import ImageDropTarget, { TypedFile } from '../components/ImageDropTarget';
import useLayerMenu from '../hooks/useLayerMenu';
import { useSize } from '../hooks/useSize';
import * as MouseEvent from '../utils/mouseEvent';
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

function getCursorForDirection(
  direction: CompassDirection,
  state: ApplicationState,
): CSSProperties['cursor'] {
  if (getSelectedLineLayer(state)) {
    return 'move';
  }
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
    sizes: { sidebarWidth },
  } = theme;
  const [state, dispatch] = useApplicationState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const CanvasKit = useCanvasKit();
  const containerSize = useSize(containerRef);
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const { setCanvasSize, highlightLayer, highlightedLayer } = useWorkspace();
  const bind = useGesture({
    onWheel: ({ delta: [x, y] }) => {
      dispatch('pan', { x, y });
    },
  });

  const isEditingPath = Selectors.getIsEditingPath(state.interactionState.type);
  const nudge = (axis: 'X' | 'Y', amount: number) => {
    if (isEditingPath && state.selectedControlPoint) {
      dispatch(`setControlPoint${axis}` as const, amount, 'adjust');
    } else if (isEditingPath) {
      dispatch(
        `setPoint${axis}` as const,
        state.selectedPointLists,
        amount,
        'adjust',
      );
    } else {
      dispatch(`setLayer${axis}` as const, amount, 'adjust');
    }
  };

  useKeyboardShortcuts({
    ArrowLeft: () => nudge('X', -1),
    ArrowRight: () => nudge('X', 1),
    ArrowUp: () => nudge('Y', -1),
    ArrowDown: () => nudge('Y', 1),
    'Shift-ArrowLeft': () => nudge('X', -10),
    'Shift-ArrowRight': () => nudge('X', 10),
    'Shift-ArrowUp': () => nudge('Y', -10),
    'Shift-ArrowDown': () => nudge('Y', 10),
    Backspace: () => dispatch('deleteLayer', state.selectedObjects),
    Escape: () => dispatch('interaction', ['reset']),
    Shift: () => dispatch('setKeyModifier', 'shiftKey', true),
  });

  useKeyboardShortcuts('keyup', {
    Shift: () => dispatch('setKeyModifier', 'shiftKey', false),
  });

  const insets = useMemo(
    () => ({
      left: sidebarWidth,
      right: sidebarWidth,
      top: 0,
      bottom: 0,
    }),
    [sidebarWidth],
  );

  // Update the canvas size whenever the window is resized
  useLayoutEffect(() => {
    if (!containerSize) return;

    setCanvasSize(containerSize, insets);
  }, [insets, setCanvasSize, containerSize]);

  const visibleCanvasSize = useMemo(
    () => containerSize ?? { width: 0, height: 0 },
    [containerSize],
  );

  const canvasSizeWithInsets = useMemo(
    () =>
      containerSize && containerSize.width > 0 && containerSize.height > 0
        ? {
            width: containerSize.width + insets.left + insets.right,
            height: containerSize.height,
          }
        : undefined,
    [containerSize, insets.left, insets.right],
  );

  // Event coordinates are relative to (0,0), but we want them to include
  // the current document's offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) => {
      return {
        x: point.x - meta.scrollOrigin.x,
        y: point.y - meta.scrollOrigin.y,
      };
    },
    [meta],
  );

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const [menuItems, onSelectMenuItem] = useLayerMenu(selectedLayers);

  const handleMouseDown = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      if (MouseEvent.isRightButtonClicked(event)) {
        const layer = Selectors.getLayerAtPoint(
          CanvasKit,
          state,
          insets,
          rawPoint,
          {
            clickThroughGroups: event.metaKey,
            includeHiddenLayers: false,
            includeArtboardLayers: false,
          },
        );

        if (!layer) {
          dispatch('selectLayer', undefined);
        } else if (!state.selectedObjects.includes(layer.do_objectID)) {
          dispatch('selectLayer', layer.do_objectID);
        }

        return;
      }

      if (!MouseEvent.isLeftButtonClicked(event)) return;

      switch (state.interactionState.type) {
        case 'insertArtboard':
        case 'insertRectangle':
        case 'insertOval':
        case 'insertText': {
          const id = uuid();

          dispatch('interaction', [
            'startDrawing',
            state.interactionState.type.slice(6).toLowerCase() as ShapeType,
            id,
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
            state.selectedObjects,
            {
              clickThroughGroups: true,
              includeArtboardLayers: false,
              includeHiddenLayers: false,
            },
          );

          Selectors.getSelectedLayers(state)
            .filter(Layers.isPointsLayer)
            .forEach((layer) => {
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

          const indexPathOfOpenShapeLayer = Selectors.getIndexPathOfOpenShapeLayer(
            state,
          );

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
                shiftKey || event.metaKey
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
          } else if (indexPathOfOpenShapeLayer) {
            dispatch('addPointToPath', point);
            dispatch('interaction', ['maybeConvertCurveMode', point]);
          } else if (!(shiftKey || event.metaKey)) {
            dispatch('interaction', ['reset']);
          }
          break;
        }
        case 'hoverHandle':
        case 'none': {
          if (state.selectedObjects.length > 0) {
            const direction = Selectors.getScaleDirectionAtPoint(state, point);

            if (direction) {
              dispatch('interaction', [
                'maybeScale',
                point,
                direction,
                visibleCanvasSize,
              ]);

              return;
            }
          }

          const layer = Selectors.getLayerAtPoint(
            CanvasKit,
            state,
            insets,
            rawPoint,
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
            },
          );

          if (layer) {
            if (state.selectedObjects.includes(layer.do_objectID)) {
              if (event.shiftKey && state.selectedObjects.length !== 1) {
                dispatch('selectLayer', layer.do_objectID, 'difference');
              }
            } else {
              dispatch(
                'selectLayer',
                layer.do_objectID,
                event.shiftKey ? 'intersection' : 'replace',
              );
            }

            dispatch('interaction', ['maybeMove', point, visibleCanvasSize]);
          } else {
            dispatch('selectLayer', undefined);

            dispatch('interaction', ['startMarquee', rawPoint]);
          }
          break;
        }
      }
    },
    [offsetEventPoint, state, CanvasKit, insets, dispatch, visibleCanvasSize],
  );

  const handleMouseMove = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
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
                ? 'startMoving'
                : 'startScaling',
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
            insets,
            createRect(origin, current),
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
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
            state,
            insets,
            rawPoint,
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
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

          if (state.selectedObjects.length > 0) {
            const direction = Selectors.getScaleDirectionAtPoint(state, point);

            if (direction) {
              dispatch('interaction', ['hoverHandle', direction]);

              return;
            }
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
      selectedLayers,
      insets,
      highlightedLayer?.id,
      highlightLayer,
    ],
  );

  const handleMouseUp = useCallback(
    (event) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
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
            insets,
            createRect(origin, current),
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
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
        case 'maybeScale': {
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
    [offsetEventPoint, state, dispatch, insets],
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
      case 'insertArtboard':
      case 'insertOval':
      case 'insertRectangle':
      case 'insertText':
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
      default:
        return 'default';
    }
  }, [state, handleDirection]);

  const onDropFile = useCallback(
    async (
      file: TypedFile<SupportedImageUploadType>,
      offsetPoint: OffsetPoint,
    ) => {
      const rawPoint = getPoint(offsetPoint);
      const point = offsetEventPoint(rawPoint);

      if (file.type === 'image/svg+xml') {
        const svgString = await file.text();
        const name = file.name.replace(/\.svg$/, '');
        dispatch('importSvg', point, name, svgString);
        return;
      }

      const data = await file.arrayBuffer();
      const image = CanvasKit.MakeImageFromEncoded(data);

      if (!image) return;

      const size = {
        width: image.width(),
        height: image.height(),
      };

      const frame = {
        ...size,
        x: point.x - size.width / 2,
        y: point.y - size.height / 2,
      };

      dispatch('insertBitmap', data, {
        name: file.name,
        frame: frame,
        extension: getFileExtensionForType(file.type),
      });
    },
    [CanvasKit, dispatch, offsetEventPoint],
  );

  return (
    <ImageDropTarget
      onDropFile={onDropFile}
      supportedFileTypes={SUPPORTED_IMAGE_UPLOAD_TYPES}
    >
      <ContextMenu items={menuItems} onSelect={onSelectMenuItem}>
        <Container
          ref={containerRef}
          cursor={cursor}
          {...mergeEventHandlers(bind(), {
            onPointerDown: handleMouseDown,
            onPointerMove: handleMouseMove,
            onPointerUp: handleMouseUp,
          })}
        >
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
    </ImageDropTarget>
  );
});
