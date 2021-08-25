import { ChevronRightIcon } from '@radix-ui/react-icons';
import styled from 'styled-components';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { memo, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
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

const StyledItemIndicator = styled(RadixContextMenu.ItemIndicator)(
  styles.itemIndicatorStyle,
);

interface ContextMenuItemProps<T extends string> {
  children: ReactNode;
  onSelect?: () => void;
  checked: boolean;
  disabled: boolean;
  indented: boolean;
  items?: MenuItem<T>[];
}

const ContextMenuItem = memo(function ContextMenuItem<T extends string>({
  indented,
  checked,
  disabled,
  items,
  children,
  onSelect,
}: ContextMenuItemProps<T>) {
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
  }

  const element = (
    <ItemElement onSelect={items && items.length > 0 ? undefined : onSelect}>
      {indented && (
        <Spacer.Horizontal size={CHECKBOX_WIDTH - CHECKBOX_RIGHT_INSET} />
      )}
      {children}
      {items && items.length > 0 && (
        <>
          <Spacer.Horizontal />
          <ChevronRightIcon />
        </>
      )}
    </ItemElement>
  );

  if (items && items.length > 0) {
    return (
      <ContextMenuRoot isNested items={items} onSelect={onSelect}>
        {element}
      </ContextMenuRoot>
    );
  } else {
    return element;
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
  isNested?: boolean;
}

function ContextMenuRoot<T extends string>({
  items,
  children,
  onSelect,
  isNested,
}: Props<T>) {
  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  return (
    <RadixContextMenu.Root>
      {isNested ? (
        <RadixContextMenu.TriggerItem as={Slot}>
          {children}
        </RadixContextMenu.TriggerItem>
      ) : (
        <RadixContextMenu.Trigger as={Slot}>
          {children}
        </RadixContextMenu.Trigger>
      )}
      <RootElement>
        {items.map((item, index) =>
          item === SEPARATOR_ITEM ? (
            <SeparatorElement key={index} />
          ) : (
            <ContextMenuItem
              key={item.value}
              indented={hasCheckedItem}
              checked={item.checked ?? false}
              disabled={item.disabled ?? false}
              onSelect={item.value ? () => onSelect?.(item.value!) : undefined}
              items={item.items}
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
