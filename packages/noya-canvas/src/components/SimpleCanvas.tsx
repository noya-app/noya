import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { ContextMenu, SupportedImageUploadType } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import React, { memo, useMemo, useRef } from 'react';
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
  const { setIsContextMenuOpen } = useWorkspace();

  const { actions, handlers, getMenuItems, onSelectMenuItem } =
    useInteractionHandlers({
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
  const items = getMenuItems();

  useCopyHandler();

  usePasteHandler<SupportedImageUploadType>({
    onPasteLayers: actions.addLayer,
  });

  return (
    <ContextMenu
      items={items}
      onSelect={(id) => {
        onSelectMenuItem?.(id);
      }}
      onOpenChange={(isOpen) => {
        setIsContextMenuOpen(isOpen);
      }}
    >
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
    </ContextMenu>
  );
});
