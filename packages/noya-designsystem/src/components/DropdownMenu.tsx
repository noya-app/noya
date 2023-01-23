import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon } from 'noya-icons';
import { useKeyboardShortcuts } from 'noya-keymap';
import React, { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { MenuItemProps, MenuProps } from './ContextMenu';
import {
  CHECKBOX_RIGHT_INSET,
  CHECKBOX_WIDTH,
  getKeyboardShortcutsForMenuItems,
  KeyboardShortcut,
  SEPARATOR_ITEM,
  styles,
} from './internal/Menu';
import { Spacer } from './Spacer';

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

const StyledItemIndicator = styled(RadixDropdownMenu.ItemIndicator)(
  styles.itemIndicatorStyle,
);

const DropdownMenuItem = memo(function ContextMenuItem<T extends string>({
  value,
  children,
  onSelect,
  checked,
  disabled,
  indented,
  icon,
  items,
  shortcut,
}: MenuItemProps<T>) {
  const handleSelectItem = useCallback(() => {
    if (!value) return;

    onSelect(value);
  }, [onSelect, value]);

  if (checked) {
    return (
      <CheckboxItemElement
        checked={checked}
        disabled={disabled}
        onSelect={handleSelectItem}
      >
        <StyledItemIndicator>
          <CheckIcon />
        </StyledItemIndicator>
        {icon && (
          <>
            {icon}
            <Spacer.Horizontal size={8} />
          </>
        )}
        {children}
      </CheckboxItemElement>
    );
  }

  const element = (
    <ItemElement disabled={disabled} onSelect={handleSelectItem}>
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
      {shortcut && (
        <>
          <Spacer.Horizontal />
          <Spacer.Horizontal size={24} />
          <KeyboardShortcut shortcut={shortcut} />
        </>
      )}
      {items && items.length > 0 && (
        <>
          <Spacer.Horizontal />
          <Spacer.Horizontal size={16} />
          <ChevronRightIcon />
        </>
      )}
    </ItemElement>
  );

  if (items && items.length > 0) {
    return (
      <DropdownMenuRoot isNested items={items} onSelect={onSelect}>
        {element}
      </DropdownMenuRoot>
    );
  } else {
    return element;
  }
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const Content = styled(RadixDropdownMenu.Content)(styles.contentStyle);
const SubContent = styled(RadixDropdownMenu.SubContent)(styles.contentStyle);

function DropdownMenuRoot<T extends string>({
  items,
  children,
  onSelect,
  isNested,
  shouldBindKeyboardShortcuts,
  onOpenChange,
}: MenuProps<T>) {
  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  const keymap = useMemo(
    () =>
      isNested || shouldBindKeyboardShortcuts === false
        ? {}
        : getKeyboardShortcutsForMenuItems(items, onSelect),
    [isNested, items, onSelect, shouldBindKeyboardShortcuts],
  );

  useKeyboardShortcuts(keymap);

  const RootComponent = isNested
    ? RadixDropdownMenu.Sub
    : RadixDropdownMenu.Root;
  const TriggerComponent = isNested
    ? RadixDropdownMenu.SubTrigger
    : RadixDropdownMenu.Trigger;
  const ContentComponent = isNested ? SubContent : Content;

  return (
    <RootComponent onOpenChange={onOpenChange}>
      <TriggerComponent asChild>{children}</TriggerComponent>
      <RadixDropdownMenu.Portal>
        <ContentComponent sideOffset={4}>
          {items.map((item, index) =>
            item === SEPARATOR_ITEM ? (
              <SeparatorElement key={index} />
            ) : (
              <DropdownMenuItem
                key={item.value ?? index}
                value={item.value}
                indented={hasCheckedItem}
                checked={item.checked ?? false}
                disabled={item.disabled ?? false}
                icon={item.icon}
                onSelect={onSelect}
                items={item.items}
                shortcut={item.shortcut}
              >
                {item.title}
              </DropdownMenuItem>
            ),
          )}
        </ContentComponent>
      </RadixDropdownMenu.Portal>
    </RootComponent>
  );
}

export const DropdownMenu = memo(DropdownMenuRoot);
