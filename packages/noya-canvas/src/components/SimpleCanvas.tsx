import { useApplicationState } from 'noya-app-state-context';
import { mergeEventHandlers, useModKey } from 'noya-designsystem';
import { Insets, Point, Rect, Size } from 'noya-geometry';
import { IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS } from 'noya-keymap';
import { OffsetPoint } from 'noya-react-utils';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { getCurrentPage, LayerTraversalOptions, Selectors } from 'noya-state';
import React, {
  CSSProperties,
  memo,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { useAutomaticCanvasSize } from '../hooks/useAutomaticCanvasSize';
import {
  marqueeInteraction,
  MarqueeInteractionHandlers,
} from '../interactions/marquee';
import {
  selectionInteraction,
  SelectionInteractionHandlers,
} from '../interactions/selection';
import { InteractionAPI } from '../interactions/types';

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

const Container = styled.div<{ cursor: CSSProperties['cursor'] }>(
  ({ cursor }) => ({
    flex: '1',
    position: 'relative',
    cursor,
  }),
);

interface Props {
  children: ({ size }: { size: Size }) => JSX.Element;
  rendererZIndex?: number;
}

export const SimpleCanvas = memo(function SimpleCanvas({
  children,
  rendererZIndex = 0,
}: Props) {
  const [state, dispatch] = useApplicationState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const { canvasSize, canvasInsets } = useAutomaticCanvasSize({
    containerRef,
    onChangeSize: useCallback(
      (size, insets) => dispatch('setCanvasSize', size, insets),
      [dispatch],
    ),
  });

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
      containerRef,
      modKey,
      selectedLayerIds: state.selectedLayerIds,
      getRawPoint: getPoint,
      getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => {
        const layers = Selectors.getLayersInRect(
          state,
          getCurrentPage(state),
          canvasInsets,
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
          canvasInsets,
          point,
          options,
        )?.do_objectID;
      },
    };
  }, [CanvasKit, canvasInsets, fontManager, modKey, state]);

  const interactions = [selectionInteraction, marqueeInteraction];

  const handlers = interactions.map((interaction) => {
    const interactionHandlers = interaction(actions);

    return (
      interactionHandlers(state.interactionState)(
        state.interactionState.type,
        api,
      ) ?? {}
    );
  });

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Container
      id="canvas-container"
      ref={containerRef}
      cursor={'default'}
      {...mergeEventHandlers(...handlers)}
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
  );
});
