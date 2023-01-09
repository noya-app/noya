import { useApplicationState } from 'noya-app-state-context';
import { Selectors } from 'noya-state';
import React, { memo, useMemo, useRef } from 'react';
import {
  Interaction,
  useInteractionHandlers,
} from '../hooks/useInteractionHandlers';
import {
  CanvasElement,
  CanvasElementProps,
  ZERO_INSETS,
} from './CanvasElement';
import { ICanvasElement } from './types';

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

  const { handlers } = useInteractionHandlers({
    interactions,
    elementInterface: {
      focus: () => ref.current?.focus(),
      releasePointerCapture: (pointerId) =>
        ref.current?.releasePointerCapture(pointerId),
      setPointerCapture: (pointerId) =>
        ref.current?.setPointerCapture(pointerId),
    },
  });

  const cursor = useMemo(() => Selectors.getCursor(state), [state]);

  return (
    <CanvasElement
      ref={ref}
      {...handlers}
      onChangeSize={(size) => dispatch('setCanvasSize', size, ZERO_INSETS)}
      rendererZIndex={rendererZIndex}
      widgets={widgets}
      cursor={cursor}
    >
      {children}
    </CanvasElement>
  );
});
