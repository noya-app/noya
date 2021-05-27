import styled from 'styled-components';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { memo, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { SEPARATOR_ITEM, MenuItem, styles } from './internal/Menu';

export type { MenuItem };
export { SEPARATOR_ITEM };

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorElement = styled(ContextMenu.Separator)(styles.separatorStyle);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemElement = styled(ContextMenu.Item)(styles.itemStyle);

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

const RootElement = styled(ContextMenu.Content)(styles.contentStyle);

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
            <SeparatorElement key={index} />
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
