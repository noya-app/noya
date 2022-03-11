import React, { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Slot } from '@radix-ui/react-slot';
import * as RadixContextMenu from '@radix-ui/react-context-menu';

import { CheckIcon, ChevronRightIcon } from 'noya-icons';
import { useKeyboardShortcuts } from 'noya-keymap';
import { Layout } from '../Layout';
import {
  styles,
  CHECKBOX_WIDTH,
  SEPARATOR_ITEM,
  KeyboardShortcut,
  CHECKBOX_RIGHT_INSET,
  getKeyboardShortcutsForMenuItems,
} from '../internal/Menu';
import { MenuItemProps, MenuProps } from './types';

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

const ContextMenuItem = memo(function ContextMenuItem<T extends string>({
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
  // The pointer event within the context menu will bubble outside of the
  // context menu unless we stop it here.
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => event.stopPropagation(),
    [],
  );

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
        {children}
      </CheckboxItemElement>
    );
  }

  const element = (
    <ItemElement
      disabled={disabled}
      onSelect={handleSelectItem}
      onPointerDown={handlePointerDown}
    >
      {indented && (
        <Layout.Queue size={CHECKBOX_WIDTH - CHECKBOX_RIGHT_INSET} />
      )}
      {icon && (
        <>
          {icon}
          <Layout.Queue size={8} />
        </>
      )}
      {children}
      {shortcut && (
        <>
          <Layout.Queue />
          <Layout.Queue size={24} />
          <KeyboardShortcut shortcut={shortcut} />
        </>
      )}
      {items && items.length > 0 && (
        <>
          <Layout.Queue />
          <Layout.Queue size={16} />
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

function ContextMenuRoot<T extends string>({
  items,
  children,
  onSelect,
  isNested,
  shouldBindKeyboardShortcuts,
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

  // We call preventDefault both to:
  // - Disable radix-ui's long-press-to-open behavior
  //   https://github.com/radix-ui/primitives/issues/748#issuecomment-869502837
  // - Mark the event as handled, so our ListView root doesn't handle it (a hack)
  const onPointerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
  }, []);

  return (
    <RadixContextMenu.Root>
      {isNested ? (
        <RadixContextMenu.TriggerItem
          as={Slot as any}
          onPointerDown={onPointerDown}
        >
          {children}
        </RadixContextMenu.TriggerItem>
      ) : (
        <RadixContextMenu.Trigger
          as={Slot as any}
          onPointerDown={onPointerDown}
        >
          {children}
        </RadixContextMenu.Trigger>
      )}
      <RootElement>
        {items.map((item, index) =>
          item === SEPARATOR_ITEM ? (
            <SeparatorElement key={index} />
          ) : (
            <ContextMenuItem
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
            </ContextMenuItem>
          ),
        )}
      </RootElement>
    </RadixContextMenu.Root>
  );
}

export default memo(ContextMenuRoot);
