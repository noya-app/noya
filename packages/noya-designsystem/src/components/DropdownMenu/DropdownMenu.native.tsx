import React, { memo, useCallback, useRef, useState } from 'react';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import styled from 'styled-components';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import {
  styles,
  CHECKBOX_WIDTH,
  SEPARATOR_ITEM,
  KeyboardShortcut,
  CHECKBOX_RIGHT_INSET,
  // getKeyboardShortcutsForMenuItems,
} from '../internal/Menu';
import { MenuItemProps, MenuProps } from '../ContextMenu';
import { Layout } from '../Layout';

const SeparatorElement = styled(View)(styles.separatorStyle);

const ItemElement = styled(View)(styles.itemStyle);

const ItemText = styled(Text)((props) => ({
  ...props.theme.textStyles.small,
  fontWeight: 500,
  textAlign: 'left',
  color: 'white',
}));

const CheckboxItemElement = styled(View)({});
const StyledItemIndicator = styled(View)({});

const Container = styled(View)({
  flex: 1,
  zIndex: 20,
});

const Trigger = styled(TouchableOpacity)({
  flex: 1,
});

const DropdownElement = styled(Animated.View)({
  borderRadius: 4,
  paddingVertical: 4,
  backgroundColor: 'rgb(30, 30, 30)',
});

const Backdrop = styled(View)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

const DropdownMenuItem = memo(function DropdownMenuItem<T extends string>({
  value,
  label,
  onSelect,
  checked,
  disabled,
  indented,
  icon,
  items,
  shortcut,
}: MenuItemProps<T> & { label: string }) {
  const handleSelectItem = useCallback(() => {
    if (!value) return;

    onSelect(value);
  }, [onSelect, value]);

  if (checked) {
    return (
      <CheckboxItemElement>
        <StyledItemIndicator>
          <Layout.Icon name="check" />
        </StyledItemIndicator>
        <ItemText>{label}</ItemText>
      </CheckboxItemElement>
    );
  }

  const element = (
    <TouchableOpacity onPress={handleSelectItem} disabled={disabled}>
      <ItemElement>
        {indented && (
          <Layout.Queue size={CHECKBOX_WIDTH - CHECKBOX_RIGHT_INSET} />
        )}
        {icon && (
          <>
            {icon}
            <Layout.Queue size={8} />
          </>
        )}
        <ItemText>{label}</ItemText>
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
    </TouchableOpacity>
  );

  return element;
});

function DropdownMenuRoot<T extends string>({
  items,
  children,
  onSelect,
  isNested,
  shouldBindKeyboardShortcuts,
}: MenuProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<View>(null);
  const dropdownStyle = useRef({ top: 0, left: 0, width: 0 });

  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  // const keymap = useMemo(
  //   () =>
  //     isNested || shouldBindKeyboardShortcuts === false
  //       ? {}
  //       : getKeyboardShortcutsForMenuItems(items, onSelect),
  //   [isNested, items, onSelect, shouldBindKeyboardShortcuts],
  // );

  // useKeyboardShortcuts(keymap);

  const onOpenDropdown = useCallback(() => {
    if (!showDropdown) {
      containerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        const dropdownWidth = Math.max(width, 80);
        const left =
          dropdownWidth !== width ? pageX + (width - dropdownWidth) / 2 : pageX;

        dropdownStyle.current = {
          width: dropdownWidth,
          top: pageY + height + 1,
          left,
        };

        setShowDropdown(true);
      });
      return;
    }

    setShowDropdown(false);
  }, [showDropdown, setShowDropdown]);

  const onDismiss = useCallback(() => {
    setShowDropdown(false);
  }, [setShowDropdown]);

  return (
    <>
      <Container ref={containerRef}>
        <Trigger onPress={onOpenDropdown}>{children}</Trigger>
      </Container>
      <Modal transparent visible={showDropdown}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <Backdrop>
            {showDropdown && (
              <DropdownElement
                entering={FadeInUp.duration(250)}
                exiting={FadeOutUp.duration(250)}
                style={dropdownStyle.current}
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
                      label={item.title}
                    />
                  ),
                )}
              </DropdownElement>
            )}
          </Backdrop>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export default memo(DropdownMenuRoot);
