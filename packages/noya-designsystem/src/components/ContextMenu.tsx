import styled from 'styled-components';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { memo, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { SEPARATOR_ITEM, MenuItem, styles } from './internal/Menu';
import { CheckIcon } from '@radix-ui/react-icons';
import { Spacer } from '..';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorElement = styled(RadixContextMenu.Separator)(
  styles.separatorStyle,
);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemElement = styled(RadixContextMenu.Item)(styles.itemStyle);

const CheckboxItemElement = styled(RadixContextMenu.CheckboxItem)(
  styles.itemStyle,
);

interface ContextMenuItemProps {
  children: ReactNode;
  onSelect: () => void;
  checked: boolean;
  indented: boolean;
}

const CHECKBOX_WIDTH = 15;
const CHECKBOX_RIGHT_INSET = 3;

const StyledItemIndicator = styled(RadixContextMenu.ItemIndicator)({
  display: 'flex',
  alignItems: 'center',
  left: `-${CHECKBOX_WIDTH / 2}px`,
  position: 'relative',
  marginRight: `-${CHECKBOX_RIGHT_INSET}px`,
});

const ContextMenuItem = memo(function ContextMenuItem({
  indented,
  checked,
  children,
  onSelect,
}: ContextMenuItemProps) {
  if (checked) {
    return (
      <CheckboxItemElement checked={checked} onSelect={onSelect}>
        <StyledItemIndicator>
          <CheckIcon />
        </StyledItemIndicator>
        {children}
      </CheckboxItemElement>
    );
  } else {
    return (
      <ItemElement onSelect={onSelect}>
        {indented && (
          <Spacer.Horizontal size={CHECKBOX_WIDTH - CHECKBOX_RIGHT_INSET} />
        )}
        {children}
      </ItemElement>
    );
  }
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootElement = styled(RadixContextMenu.Content)(styles.contentStyle);

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
  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  return (
    <RadixContextMenu.Root>
      <RadixContextMenu.Trigger as={Slot}>{children}</RadixContextMenu.Trigger>
      <RootElement>
        {items.map((item, index) =>
          item === SEPARATOR_ITEM ? (
            <SeparatorElement key={index} />
          ) : (
            <ContextMenuItem
              key={item.value}
              indented={hasCheckedItem}
              checked={item.checked ?? false}
              onSelect={() => onSelect?.(item.value)}
            >
              {item.title}
            </ContextMenuItem>
          ),
        )}
      </RootElement>
    </RadixContextMenu.Root>
  );
}

export default memo(ContextMenuRoot);
