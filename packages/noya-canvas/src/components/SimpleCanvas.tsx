import { useApplicationState } from 'noya-app-state-context';
import {
  mergeEventHandlers,
  ReactEventHandlers,
  usePlatform,
  usePlatformModKey,
} from 'noya-designsystem';
import { Point, Rect } from 'noya-geometry';
import { handleKeyboardEvent } from 'noya-keymap';
import { OffsetPoint } from 'noya-react-utils';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import {
  CompassDirection,
  DrawableLayerType,
  getCurrentPage,
  InteractionState,
  Layers,
  LayerTraversalOptions,
  Selectors,
} from 'noya-state';
import React, { memo, useMemo, useRef } from 'react';
import { useMultipleClickCount } from '../hooks/useMultipleClickCount';
import { DrawingActions } from '../interactions/drawing';
import { EditBlockActions } from '../interactions/editBlock';
import { MarqueeActions } from '../interactions/marquee';
import { MoveActions } from '../interactions/move';
import { PanActions } from '../interactions/pan';
import { ScaleActions } from '../interactions/scale';
import { SelectionActions } from '../interactions/selection';
import { InteractionAPI } from '../interactions/types';
import { convertPoint } from '../utils/convertPoint';
import {
  CanvasElement,
  CanvasElementProps,
  ZERO_INSETS,
} from './CanvasElement';
import { ICanvasElement } from './types';

function getPoint(event: OffsetPoint): Point {
  return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
}

export type Actions = MarqueeActions &
  SelectionActions &
  MoveActions &
  ScaleActions &
  DrawingActions &
  PanActions &
  EditBlockActions;

export type Interaction = (
  actions: Actions,
) => (
  state: InteractionState,
  key: InteractionState['type'],
  api: InteractionAPI,
) => ReactEventHandlers;

interface Props {
  rendererZIndex?: CanvasElementProps['rendererZIndex'];
  children: CanvasElementProps['children'];
  widgets?: CanvasElementProps['widgets'];
  interactions?: Interaction[];
}

export const SimpleCanvas = memo(function SimpleCanvas({
  children,
  interactions,
  widgets,
  rendererZIndex = 0,
}: Props) {
  const ref = useRef<ICanvasElement>(null);

  const [state, dispatch] = useApplicationState();
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const platform = usePlatform();
  const platformModKey = usePlatformModKey();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;
  const { getClickCount, setLatestClick } = useMultipleClickCount();

  const actions = useMemo((): Actions => {
    return {
      startMarquee: (point) => dispatch('interaction', ['startMarquee', point]),
      updateMarquee: (point) =>
        dispatch('interaction', ['updateMarquee', point]),
      reset: () => dispatch('interaction', ['reset']),
      selectLayer: (layerId, selectionType) =>
        dispatch('selectLayer', layerId, selectionType),
      deleteLayer: (layerId) => dispatch('deleteLayer', layerId),
      maybeMove: (point) => dispatch('interaction', ['maybeMove', point]),
      updateMoving: (point) => dispatch('interaction', ['updateMoving', point]),
      maybeScale: (point, direction) =>
        dispatch('interaction', ['maybeScale', point, direction]),
      updateScaling: (point) =>
        dispatch('interaction', ['updateScaling', point]),
      addDrawnLayer: () => dispatch('addDrawnLayer'),
      startDrawing: (layerType: DrawableLayerType, point: Point) =>
        dispatch('interaction', ['startDrawing', layerType, point]),
      updateDrawing: (point: Point, layerType?: DrawableLayerType) =>
        dispatch('interaction', ['updateDrawing', point, layerType]),
      pan: (point) => dispatch('pan*', point),
      startPanning: (point) => dispatch('interaction', ['startPanning', point]),
      updatePanning: (point) =>
        dispatch('interaction', ['updatePanning', point]),
      maybePan: (point) => dispatch('interaction', ['maybePan', point]),
      enablePanMode: () => dispatch('interaction', ['enablePanMode']),
      hoverHandle: (direction: CompassDirection) =>
        dispatch('interaction', ['hoverHandle', direction]),
      startEditingBlock: (layerId) =>
        dispatch('interaction', ['editingBlock', layerId]),
    };
  }, [dispatch]);

  const api = useMemo((): InteractionAPI => {
    return {
      ...ref.current,
      platform,
      platformModKey,
      zoomValue,
      getClickCount,
      selectedLayerIds: state.selectedLayerIds,
      selectedGradient: state.selectedGradient,
      convertPoint: (point, system) =>
        convertPoint(scrollOrigin, zoomValue, point, system),
      getScreenPoint: getPoint,
      getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => {
        const layers = Selectors.getLayersInRect(
          state,
          getCurrentPage(state),
          ZERO_INSETS,
          rect,
          options,
        );

        return layers.map((layer) => layer.do_objectID);
      },
      getLayerIdAtPoint: (point: Point, options?: LayerTraversalOptions) => {
        return Selectors.getLayerAtPoint(
          CanvasKit,
          fontManager,
          state,
          ZERO_INSETS,
          point,
          options,
        )?.do_objectID;
      },
      getLayerTypeById: (id: string) => {
        return Layers.find(
          getCurrentPage(state),
          (layer) => layer.do_objectID === id,
        )!._class;
      },
      getScaleDirectionAtPoint: (point: Point) =>
        Selectors.getScaleDirectionAtPoint(state, point),
      handleKeyboardEvent: (keyMap) => (event) =>
        handleKeyboardEvent(event.nativeEvent, api.platform, keyMap),
    };
  }, [
    CanvasKit,
    fontManager,
    getClickCount,
    platform,
    platformModKey,
    scrollOrigin,
    state,
    zoomValue,
  ]);

  const handlers = (interactions ?? []).map((interaction) =>
    interaction(actions)(
      state.interactionState,
      state.interactionState.type,
      api,
    ),
  );

  const cursor = useMemo(() => Selectors.getCursor(state), [state]);

  return (
    <CanvasElement
      ref={ref}
      {...mergeEventHandlers(
        {
          onPointerDown: (event) => {
            setLatestClick(getPoint(event.nativeEvent));
          },
        },
        ...handlers,
      )}
      onChangeSize={(size) => dispatch('setCanvasSize', size, ZERO_INSETS)}
      rendererZIndex={rendererZIndex}
      widgets={widgets}
      cursor={cursor}
    >
      {children}
    </CanvasElement>
  );
});
