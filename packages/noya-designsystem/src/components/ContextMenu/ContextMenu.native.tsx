import React, {
  memo,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { View, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import styled from 'styled-components';

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
import { TouchableListener } from '../internal/Touchable';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorElement = styled(View)((props) => ({
  ...styles.separatorStyle(props),
}));

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemText = styled(Text)((props) => ({
  ...props.theme.textStyles.small,
  fontWeight: 500,
  textAlign: 'left',
  color: 'white',
}));

const ItemElement = styled(View)((props) => ({
  ...styles.itemStyle(props),
}));

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
  const element = (
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
      {/* {shortcut && (
        <>
          <Layout.Queue />
          <Layout.Queue size={24} />
          <KeyboardShortcut shortcut={shortcut} />
        </>
      )} */}
      {items && items.length > 0 && (
        <>
          <Layout.Queue />
          <Layout.Queue size={16} />
          <Layout.Icon name="chevron-right" />
        </>
      )}
    </ItemElement>
  );

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

const RootContainer = styled(View)((_p) => ({}));

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
    onOpen: (x: number, y: number) => void;
  }>
> = (props) => {
  const { children, onOpen } = props;

  return (
    <TouchableListener onLongPress={onOpen}>
      <View>{children}</View>
    </TouchableListener>
  );
};

interface MenuState {
  visible: boolean;
  x: number;
  y: number;
}

function ContextMenuRoot<T extends string>({
  items,
  children,
  onSelect,
  isNested,
  shouldBindKeyboardShortcuts,
}: MenuProps<T>) {
  const [state, setState] = useState<MenuState>({ visible: false, x: 0, y: 0 });
  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  const onOpen = useCallback(
    (x: number, y: number) => {
      setState({ visible: true, x, y });
    },
    [setState],
  );

  return (
    <RootContainer>
      {/* {isNested ? (
        <TriggerItem>{children}</TriggerItem>
      ) : ( */}
      <Trigger onOpen={onOpen}>{children}</Trigger>
      {/* )} */}
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
                      onSelect={onSelect}
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
    </RootContainer>
  );
}

export default memo(ContextMenuRoot);
