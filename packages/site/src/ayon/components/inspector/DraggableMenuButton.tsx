import { DropdownMenu, useDesignSystemTheme } from 'noya-designsystem';
import { DragHandleDots2Icon } from 'noya-icons';
import React, { ComponentProps, memo, useCallback, useState } from 'react';
import styled from 'styled-components';

const DotButtonElement = styled.div(({ theme }) => ({
  borderRadius: '4px',
  padding: '2px 0',
  '&:hover': {
    background: theme.colors.inputBackgroundLight,
  },
  '&:active': {
    background: theme.colors.activeBackground,
  },
}));

const TriggerElement = styled.div({
  pointerEvents: 'none',
});

/**
 * A button that opens a menu when clicked, but also allows dragging the
 */
export const DraggableMenuButton = memo(function DraggableMenuButton({
  items,
  onSelect,
}: Pick<ComponentProps<typeof DropdownMenu>, 'items' | 'onSelect'>) {
  const color = useDesignSystemTheme().colors.icon;
  const [open, setOpen] = useState(false);
  const [downPosition, setDownPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const handlePointerDownCapture = useCallback(
    (event: React.PointerEvent) => {
      if (open) {
        setDownPosition(null);
        return;
      }

      setDownPosition({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [open],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (open || !downPosition) {
        setDownPosition(null);
        return;
      }

      const dx = event.clientX - downPosition.x;
      const dy = event.clientY - downPosition.y;

      const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      if (distance < 5) {
        setOpen(true);
      }

      setDownPosition(null);
    },
    [downPosition, open],
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) setOpen(false);
    },
    [setOpen],
  );

  return (
    <DotButtonElement
      onPointerDownCapture={handlePointerDownCapture}
      onPointerUp={handlePointerUp}
    >
      <DropdownMenu
        open={open}
        onOpenChange={handleOpenChange}
        items={items}
        onSelect={onSelect}
        shouldBindKeyboardShortcuts={false}
      >
        <TriggerElement>
          <DragHandleDots2Icon color={color} />
        </TriggerElement>
      </DropdownMenu>
    </DotButtonElement>
  );
});
