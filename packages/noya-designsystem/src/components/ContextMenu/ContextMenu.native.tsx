import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  PropsWithChildren,
} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import styled from 'styled-components';

import { useKeyCommands } from 'noya-keymap';
import { TouchEvent, TouchableListener } from '../Touchable';
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

const SeparatorElement = styled(View)(styles.separatorStyle);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemText = styled(Text)((props) => ({
  ...props.theme.textStyles.small,
  fontWeight: 500,
  textAlign: 'left',
  color: 'white',
}));

const ItemElement = styled(View)(styles.itemStyle);

const ContextMenuItem = memo(function ContextMenuItem<T extends string>({
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

  // TODO: nesting menus
  // if (items && items.length > 0) {
  //   return (
  //     <ContextMenuRoot isNested items={items} onSelect={onSelect}>
  //       {element}
  //     </ContextMenuRoot>
  //   );
  // }

  return element;
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const Backdrop = styled(View)((_p) => ({
  width: '100%',
  height: '100%',
}));

const RootContent = styled(View)<{ x: number; y: number }>((props) => ({
  position: 'absolute',
  left: props.x,
  top: props.y,
  ...styles.contentStyle(props),
}));

const Trigger: React.FC<
  PropsWithChildren<{
    onOpen: (event: TouchEvent) => void;
  }>
> = (props) => {
  const { children, onOpen } = props;

  return <TouchableListener onLongPress={onOpen}>{children}</TouchableListener>;
};

interface MenuState {
  visible: boolean;
  x: number;
  y: number;
}

function ContextMenuRoot<T extends string>({
  shouldBindKeyboardShortcuts,
  isNested,
  items,
  children,
  onSelect,
}: MenuProps<T>) {
  const [state, setState] = useState<MenuState>({ visible: false, x: 0, y: 0 });
  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  // TODO: keybindings for mobile
  const keymap = useMemo(
    () =>
      isNested || shouldBindKeyboardShortcuts === false
        ? {}
        : getKeyboardShortcutsForMenuItems(items, onSelect),
    [isNested, items, onSelect, shouldBindKeyboardShortcuts],
  );

  useKeyCommands(keymap);

  const onOpen = useCallback(
    (event: TouchEvent) => {
      setState({ visible: true, ...event.absolutePoint });
    },
    [setState],
  );

  const onClose = useCallback(() => {
    setState({ visible: false, x: 0, y: 0 });
  }, [setState]);

  const handleSelect = useCallback(
    (value: T) => {
      onClose();
      onSelect(value);
    },
    [onSelect, onClose],
  );

  return (
    <>
      <Trigger onOpen={onOpen}>{children}</Trigger>
      <Modal visible={state.visible} transparent>
        <TouchableWithoutFeedback
          onPress={() => {
            setState({ visible: false, x: 0, y: 0 });
          }}
        >
          <Backdrop>
            <TouchableWithoutFeedback onPress={() => {}}>
              <RootContent x={state.x} y={state.y}>
                {items.map((item, index) =>
                  item === SEPARATOR_ITEM ? (
                    <SeparatorElement key={index} />
                  ) : (
                    <ContextMenuItem<T>
                      key={item.value ?? index}
                      value={item.value}
                      indented={hasCheckedItem}
                      checked={item.checked ?? false}
                      disabled={item.disabled ?? false}
                      icon={item.icon}
                      onSelect={handleSelect}
                      items={item.items}
                      shortcut={item.shortcut}
                      label={item.title}
                    />
                  ),
                )}
              </RootContent>
            </TouchableWithoutFeedback>
          </Backdrop>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export default memo(ContextMenuRoot);
