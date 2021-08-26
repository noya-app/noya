import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Slot } from '@radix-ui/react-slot';
import {
  getDisplayName,
  PlatformName,
  useKeyboardShortcuts,
} from 'noya-keymap';
import { memo, ReactElement, ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Spacer } from '..';
import {
  CHECKBOX_RIGHT_INSET,
  CHECKBOX_WIDTH,
  getKeyboardShortcutsForMenuItems,
  MenuItem,
  SEPARATOR_ITEM,
  styles,
} from './internal/Menu';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorElement = styled(RadixDropdownMenu.Separator)(
  styles.separatorStyle,
);

/* ----------------------------------------------------------------------------
 * Shortcut
 * ------------------------------------------------------------------------- */

const ShortcutElement = styled.kbd(styles.shortcutStyle);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemElement = styled(RadixDropdownMenu.Item)(styles.itemStyle);

const CheckboxItemElement = styled(RadixDropdownMenu.CheckboxItem)(
  styles.itemStyle,
);

interface ContextMenuItemProps<T extends string> {
  value?: T;
  children: ReactNode;
  onSelect: (value: T) => void;
  checked: boolean;
  disabled: boolean;
  indented: boolean;
  shortcut?: string;
  icon?: ReactElement;
  items?: MenuItem<T>[];
  platform: PlatformName;
}

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
  platform,
}: ContextMenuItemProps<T>) {
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
          <Spacer.Horizontal size={16} />
          <ShortcutElement>
            {getDisplayName(shortcut, platform)}
          </ShortcutElement>
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
      <DropdownMenuRoot
        isNested
        items={items}
        onSelect={onSelect}
        platform={platform}
      >
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

interface Props<T extends string> {
  children: ReactNode;
  items: MenuItem<T>[];
  onSelect: (value: T) => void;
  isNested?: boolean;
  platform: PlatformName;
  shouldBindKeyboardShortcuts?: boolean;
}

function DropdownMenuRoot<T extends string>({
  items,
  children,
  onSelect,
  isNested,
  platform,
  shouldBindKeyboardShortcuts,
}: Props<T>) {
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
      <RootElement sideOffset={4}>
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
              platform={platform}
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
