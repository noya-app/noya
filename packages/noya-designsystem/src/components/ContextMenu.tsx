import styled from 'styled-components';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { memo, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';

export const SEPARATOR_ITEM = 'separator';

const StyledSeparator = styled(ContextMenu.Separator)(({ theme }) => ({
  height: '1px',
  backgroundColor: theme.colors.divider,
  margin: '4px 8px',
}));

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemElement = styled(ContextMenu.Item)(({ theme, disabled }) => ({
  ...theme.textStyles.small,
  fontWeight: 500,
  fontSize: '0.8rem',
  flex: '0 0 auto',
  userSelect: 'none',
  cursor: 'pointer',
  borderRadius: '3px',
  padding: '2px 8px',
  ...(disabled && {
    color: theme.colors.textDisabled,
  }),
  '&:focus': {
    outline: 'none',
    color: 'white',
    backgroundColor: theme.colors.primary,
  },
  display: 'flex',
  alignItems: 'center',
}));

interface ContextMenuItemProps {
  children: ReactNode;
  onSelect: () => void;
}

function ContextMenuItem({ children, onSelect }: ContextMenuItemProps) {
  return <ItemElement onSelect={onSelect}>{children}</ItemElement>;
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootElement = styled(ContextMenu.Content)(({ theme }) => ({
  borderRadius: 4,
  backgroundColor: theme.colors.popover.background,
  color: theme.colors.text,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  padding: '4px',
  border: `1px solid ${theme.colors.divider}`,
}));

export type MenuItem<T extends string> =
  | typeof SEPARATOR_ITEM
  | { value: T; title: string };

interface Props<T extends string> {
  children: ReactNode;
  items: MenuItem<T>[];
  onSelect?: (value: T) => void;
}

function ContextMenuRoot<T extends string>({
  items,
  children,
  onSelect,
}: Props<T>) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger as={Slot}>{children}</ContextMenu.Trigger>
      <RootElement>
        {items.map((item, index) =>
          item === SEPARATOR_ITEM ? (
            <StyledSeparator key={index} />
          ) : (
            <ContextMenuItem
              key={item.value}
              onSelect={() => onSelect?.(item.value)}
            >
              {item.title}
            </ContextMenuItem>
          ),
        )}
      </RootElement>
    </ContextMenu.Root>
  );
}

export const Item = memo(ContextMenuItem);
export const Root = memo(ContextMenuRoot);
