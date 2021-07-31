import { memo, ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  SEPARATOR_ITEM,
  MenuItem,
  styles,
  CHECKBOX_WIDTH,
  CHECKBOX_RIGHT_INSET,
} from './internal/Menu';
import { CheckIcon } from '@radix-ui/react-icons';
import { Spacer } from '..';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorElement = styled(RadixDropdownMenu.Separator)(
  styles.separatorStyle,
);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemElement = styled(RadixDropdownMenu.Item)(styles.itemStyle);

const CheckboxItemElement = styled(RadixDropdownMenu.CheckboxItem)(
  styles.itemStyle,
);

interface ContextMenuItemProps {
  children: ReactNode;
  onSelect: () => void;
  checked: boolean;
  disabled: boolean;
  indented: boolean;
  icon?: ReactElement;
}

const StyledItemIndicator = styled(RadixDropdownMenu.ItemIndicator)(
  styles.itemIndicatorStyle,
);

const DropdownMenuItem = memo(function ContextMenuItem({
  children,
  onSelect,
  checked,
  disabled,
  indented,
  icon,
}: ContextMenuItemProps) {
  if (checked) {
    return (
      <CheckboxItemElement
        checked={checked}
        disabled={disabled}
        onSelect={onSelect}
      >
        <StyledItemIndicator>
          <CheckIcon />
        </StyledItemIndicator>
        {children}
      </CheckboxItemElement>
    );
  } else {
    return (
      <ItemElement disabled={disabled} onSelect={onSelect}>
        {indented && (
          <Spacer.Horizontal size={CHECKBOX_WIDTH - CHECKBOX_RIGHT_INSET} />
        )}
        {icon && (
          <>
            {icon}
            <Spacer.Horizontal size={8} />
          </>
        )}
        {children}
      </ItemElement>
    );
  }
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootElement = styled(RadixDropdownMenu.Content)(styles.contentStyle);

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
  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger as={'span'}>
        {children}
      </RadixDropdownMenu.Trigger>
      <RootElement sideOffset={4}>
        {items.map((item, index) =>
          item === SEPARATOR_ITEM ? (
            <SeparatorElement key={index} />
          ) : (
            <DropdownMenuItem
              key={item.value}
              indented={hasCheckedItem}
              checked={item.checked ?? false}
              disabled={item.disabled ?? false}
              icon={item.icon}
              onSelect={() => onSelect?.(item.value)}
            >
              {item.title}
            </DropdownMenuItem>
          ),
        )}
      </RootElement>
    </RadixDropdownMenu.Root>
  );
}

export default memo(DropdownMenuRoot);
