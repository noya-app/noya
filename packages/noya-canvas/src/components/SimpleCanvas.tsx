import { useApplicationState } from 'noya-app-state-context';
import { mergeEventHandlers, useModKey } from 'noya-designsystem';
import { Point, Rect } from 'noya-geometry';
import { OffsetPoint } from 'noya-react-utils';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { getCurrentPage, LayerTraversalOptions, Selectors } from 'noya-state';
import React, { memo, useMemo, useRef } from 'react';
import {
  marqueeInteraction,
  MarqueeInteractionHandlers,
} from '../interactions/marquee';
import {
  selectionInteraction,
  SelectionInteractionHandlers,
} from '../interactions/selection';
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

interface Props {
  rendererZIndex?: CanvasElementProps['rendererZIndex'];
  children: CanvasElementProps['children'];
}

export const SimpleCanvas = memo(function SimpleCanvas({
  children,
  rendererZIndex = 0,
}: Props) {
  const ref = useRef<ICanvasElement>(null);

  const [state, dispatch] = useApplicationState();
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const modKey = useModKey();

  const actions = useMemo((): MarqueeInteractionHandlers &
    SelectionInteractionHandlers => {
    return {
      startMarquee: (point) => dispatch('interaction', ['startMarquee', point]),
      updateMarquee: (point) =>
        dispatch('interaction', ['updateMarquee', point]),
      reset: () => dispatch('interaction', ['reset']),
      selectLayer: (layerId, selectionType) =>
        dispatch('selectLayer', layerId, selectionType),
    };
  }, [dispatch]);

  const api = useMemo((): InteractionAPI => {
    return {
      ...ref.current,
      modKey,
      selectedLayerIds: state.selectedLayerIds,
      getRawPoint: getPoint,
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
  }, [CanvasKit, fontManager, modKey, state]);

  const interactions = [selectionInteraction, marqueeInteraction];

  const handlers = interactions.map((interaction) =>
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
