import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { ContextMenu, SupportedImageUploadType } from 'noya-designsystem';
import { ResizePosition } from 'noya-geometry';
import { useKeyboardShortcuts } from 'noya-keymap';
import { ILogEvent } from 'noya-log';
import { Selectors } from 'noya-state';
import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useCopyHandler } from '../hooks/useCopyHandler';
import {
  Interaction,
  useInteractionHandlers,
} from '../hooks/useInteractionHandlers';
import { usePasteHandler } from '../hooks/usePasteHandler';
import {
  CanvasElement,
  CanvasElementProps,
  ZERO_INSETS,
} from './CanvasElement';
import { ICanvasElement } from './types';

interface Props {
  rendererZIndex?: CanvasElementProps['rendererZIndex'];
  children?: CanvasElementProps['children'];
  widgets?: CanvasElementProps['widgets'];
  autoFocus?: CanvasElementProps['autoFocus'];
  interactions?: Interaction[];
  padding?: number;
  logEvent?: ILogEvent;
  position?: ResizePosition;
}

export interface ISimpleCanvas {
  focus: () => void;
}

export const SimpleCanvas = memo(
  forwardRef(function SimpleCanvas(
    {
      children,
      interactions,
      widgets,
      rendererZIndex = 0,
      padding = 0,
      position,
      logEvent,
      autoFocus,
    }: Props,
    forwardedRef: ForwardedRef<ISimpleCanvas>,
  ) {
    const ref = useRef<ICanvasElement>(null);
    const [state, dispatch] = useApplicationState();
    const { setIsContextMenuOpen } = useWorkspace();
    const { canvasSize } = useWorkspace();

    useImperativeHandle(forwardedRef, () => ({
      focus: () => ref.current?.focus(),
    }));

    const {
      actions,
      handlers,
      menuItems,
      onSelectMenuItem,
      keyboardShortcuts,
    } = useInteractionHandlers({
      interactions,
      elementInterface: {
        focus: () => ref.current?.focus(),
        releasePointerCapture: (pointerId) =>
          ref.current?.releasePointerCapture(pointerId),
        setPointerCapture: (pointerId) =>
          ref.current?.setPointerCapture(pointerId),
      },
      logEvent: (...args) => logEvent?.(...args),
    });

    const cursor = useMemo(() => Selectors.getCursor(state), [state]);

    useKeyboardShortcuts(keyboardShortcuts);

    useCopyHandler();

    usePasteHandler<SupportedImageUploadType>({
      onPasteLayers: (layers) =>
        actions.addLayer(layers, {
          useOriginalDimensions: true,
        }),
    });

    // When canvasSize changes, zoom to fit the isolated layer
    useLayoutEffect(() => {
      if (!state.isolatedLayerId) return;

      // canvasSize always exists, but we include it here so it's automatically added
      // as a dependency of useLayoutEffect
      if (!canvasSize) return;

      dispatch(
        'zoomToFit*',
        { type: 'layer', value: state.isolatedLayerId },
        { padding, max: 1, position },
      );
    }, [canvasSize, state.isolatedLayerId, dispatch, padding, position]);

    return (
      <ContextMenu
        items={menuItems}
        onSelect={(id) => {
          onSelectMenuItem?.(id);
        }}
        onOpenChange={(isOpen) => {
          setIsContextMenuOpen(isOpen);

          // Prevents a confusing state where the context menu is open but the
          // drawing interaction is still active. Maybe we should generalize
          // this to other interactions and/or make an API for it?
          if (state.interactionState.type === 'drawing') {
            actions.reset();
          }
        }}
      >
        <CanvasElement
          ref={ref}
          {...handlers}
          onChangeSize={(size) => dispatch('setCanvasSize', size, ZERO_INSETS)}
          rendererZIndex={rendererZIndex}
          widgets={widgets}
          cursor={cursor}
          autoFocus={autoFocus}
        >
          {children}
        </CanvasElement>
      </ContextMenu>
    );
  }),
);
