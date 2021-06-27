import { memo, ReactNode } from 'react';
import styled from 'styled-components';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SEPARATOR_ITEM, MenuItem, styles } from './internal/Menu';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorElement = styled(DropdownMenu.Separator)(styles.separatorStyle);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemElement = styled(DropdownMenu.Item)(styles.itemStyle);

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootElement = styled(DropdownMenu.Content)(styles.contentStyle);

interface Props<T extends string> {
  children: ReactNode;
  items: MenuItem<T>[];
  onSelect?: (value: T) => void;
}

// Using a Slot for the menu currently doesn't work with custom elements,
// so we use a span. Check for fixes in library updates in the future.
function DropdownMenuRoot<T extends string>({
  items,
  children,
  onSelect,
}: Props<T>) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger as={'span'}>{children}</DropdownMenu.Trigger>
      <RootElement sideOffset={4}>
        {items.map((item, index) =>
          item === SEPARATOR_ITEM ? (
            <SeparatorElement key={index} />
          ) : (
            <ItemElement
              key={item.value}
              onSelect={() => onSelect?.(item.value)}
            >
              {item.title}
            </ItemElement>
          ),
        )}
      </RootElement>
    </DropdownMenu.Root>
  );
}

export default memo(DropdownMenuRoot);
