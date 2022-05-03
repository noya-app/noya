import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { memo, useCallback, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import styled from 'styled-components';

import { useKeyboardShortcuts } from 'noya-keymap';
import {
  styles,
  CHECKBOX_WIDTH,
  SEPARATOR_ITEM,
  KeyboardShortcut,
  CHECKBOX_RIGHT_INSET,
  getKeyboardShortcutsForMenuItems,
} from '../internal/Menu';
import { MenuItemProps, MenuProps } from '../ContextMenu';
import { Layout } from '../Layout';

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
          <Layout.Icon name="check" />
        </StyledItemIndicator>
        {children}
      </CheckboxItemElement>
    );
  }

  const element = (
    <ItemElement disabled={disabled} onSelect={handleSelectItem}>
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
          <Layout.Icon name="chevron-right" />
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

const RootElement = styled(RadixDropdownMenu.Content)(styles.contentStyle);

function DropdownMenuRoot<T extends string>({
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

  return (
    <RadixDropdownMenu.Root>
      {isNested ? (
        <RadixDropdownMenu.TriggerItem as={Slot}>
          {children}
        </RadixDropdownMenu.TriggerItem>
      ) : (
        <RadixDropdownMenu.Trigger as={Slot}>
          {children}
        </RadixDropdownMenu.Trigger>
      )}
      <RootElement
        sideOffset={4}
        onCloseAutoFocus={useCallback((event) => {
          // Prevent the trigger from being focused, which interferes with
          // keyboard shortcuts going to the canvas
          event.preventDefault();

          // Workaround radix-ui issue where all pointerEvents become blocked
          // until the body is clicked again
          document.body.style.pointerEvents = '';
        }, [])}
      >
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
      </RootElement>
    </RadixDropdownMenu.Root>
  );
}

export default memo(DropdownMenuRoot);
