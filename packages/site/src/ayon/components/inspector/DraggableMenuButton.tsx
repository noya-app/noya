import { DragHandleDots2Icon } from '@noya-app/noya-icons';
import {
  DropdownMenu,
  MenuItem,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { memo, useCallback, useState } from 'react';
import styled from 'styled-components';

const DotButtonElement = styled.div(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  height: '15px',
});

/**
 * A button that opens a menu when clicked, but also allows dragging the
 */
export const DraggableMenuButton = memo(function DraggableMenuButton<
  T extends string,
>({
  items,
  onSelect,
  isVisible = true,
}: {
  items: MenuItem<T>[];
  onSelect: (value: T) => void;
  isVisible?: boolean;
}) {
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
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
    >
      <DropdownMenu
        open={open}
        onOpenChange={handleOpenChange}
        items={items}
        onSelect={onSelect}
        shouldBindKeyboardShortcuts={false}
      >
        <TriggerElement>
          <DragHandleDots2Icon
            color={isVisible || open ? color : 'transparent'}
          />
        </TriggerElement>
      </DropdownMenu>
    </DotButtonElement>
  );
});
