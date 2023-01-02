import { useApplicationState } from 'noya-app-state-context';
import {
  mergeEventHandlers,
  ReactEventHandlers,
  useModKey,
} from 'noya-designsystem';
import { AffineTransform, Point, Rect } from 'noya-geometry';
import { OffsetPoint } from 'noya-react-utils';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import {
  getCurrentPage,
  InteractionState,
  LayerTraversalOptions,
  Selectors,
} from 'noya-state';
import React, { memo, useMemo, useRef } from 'react';
import { MarqueeActions } from '../interactions/marquee';
import { MoveActions } from '../interactions/move';
import { SelectionActions } from '../interactions/selection';
import { InteractionAPI } from '../interactions/types';
import {
  CanvasElement,
  CanvasElementProps,
  ZERO_INSETS,
} from './CanvasElement';
import { ICanvasElement } from './types';

function getPoint(event: OffsetPoint): Point {
  return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
}

export type Actions = MarqueeActions & SelectionActions & MoveActions;

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
  interactions?: Interaction[];
}

export const SimpleCanvas = memo(function SimpleCanvas({
  children,
  interactions,
  rendererZIndex = 0,
}: Props) {
  const ref = useRef<ICanvasElement>(null);

  const [state, dispatch] = useApplicationState();
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const modKey = useModKey();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;

  const actions = useMemo((): Actions => {
    return {
      startMarquee: (point) => dispatch('interaction', ['startMarquee', point]),
      updateMarquee: (point) =>
        dispatch('interaction', ['updateMarquee', point]),
      reset: () => dispatch('interaction', ['reset']),
      selectLayer: (layerId, selectionType) =>
        dispatch('selectLayer', layerId, selectionType),
      maybeMove: (point) => dispatch('interaction', ['maybeMove', point]),
      updateMoving: (point) => dispatch('interaction', ['updateMoving', point]),
    };
  }, [dispatch]);

  const api = useMemo((): InteractionAPI => {
    // Event coordinates are relative to (0,0), but we want them to include
    // the current page's zoom and offset from the origin
    const canvasPointTransform = AffineTransform.scale(1 / zoomValue).translate(
      -scrollOrigin.x,
      -scrollOrigin.y,
    );

    return {
      ...ref.current,
      modKey,
      zoomValue,
      selectedLayerIds: state.selectedLayerIds,
      convertPoint: (point, system) => {
        switch (system) {
          case 'canvas':
            return canvasPointTransform.applyTo(point);
          case 'screen':
            return canvasPointTransform.invert().applyTo(point);
        }
      },
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
    };
  }, [
    CanvasKit,
    fontManager,
    modKey,
    scrollOrigin.x,
    scrollOrigin.y,
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

  return (
    <CanvasElement
      ref={ref}
      {...mergeEventHandlers(...handlers)}
      onChangeSize={(size) => dispatch('setCanvasSize', size, ZERO_INSETS)}
      rendererZIndex={rendererZIndex}
    >
      {children}
    </CanvasElement>
  );
});
