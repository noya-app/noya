import React, {
  memo,
  useMemo,
  useState,
  useContext,
  useCallback,
  createContext,
  useRef,
} from 'react';
import styled from 'styled-components';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { Rect } from 'noya-geometry';
import { Layout } from '../Layout';
import type { SelectProps, SelectOptionProps } from './types';

type SelectContextValue = {
  onSelect: (value: string) => void;
  value: string;
};

const SelectContext = createContext<SelectContextValue>({
  onSelect: () => {},
  value: '',
});

const Container = styled(View)((_p) => ({
  flex: 1,
  zIndex: 20,
}));

const SelectText = styled(Text)(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.text,
}));

const SelectElement = styled(View)(({ theme }) => ({
  padding: 8,
  backgroundColor: theme.colors.activeBackground,
  borderRadius: 4,
  alignSelf: 'stretch',
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

const SelectOptionElement = styled(View)(({ theme }) => ({
  paddingHorizontal: 8,
  paddingVertical: 4,
  flexDirection: 'row',
  alignItems: 'center',
}));

const DropdownElement = styled(Animated.View)(({ theme }) => ({
  borderRadius: 4,
  paddingVertical: 4,
  backgroundColor: 'rgb(30, 30, 30)',
}));

const Backdrop = styled(View)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

export const SelectOption = memo(function SelectOption<T extends string>({
  value,
  title,
  onSelect,
}: SelectOptionProps<T>) {
  const select = useContext(SelectContext);
  const onPressOption = useCallback(() => {
    if (onSelect) {
      onSelect();
      return;
    }

    select.onSelect(value);
  }, [onSelect, value, select]);

  const isActive = useMemo(() => value === select.value, [value, select.value]);

  return (
    <TouchableOpacity onPress={onPressOption}>
      <SelectOptionElement>
        {isActive ? (
          <>
            <Layout.Icon name="check" size={14} />
            <Layout.Queue size={4} />
          </>
        ) : (
          <Layout.Queue size={18} />
        )}
        <SelectText>{title ?? value}</SelectText>
      </SelectOptionElement>
    </TouchableOpacity>
  );
});

function Select<T extends string>({
  id,
  flex,
  value,
  ...rest
}: SelectProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [containerRect, setContainerRect] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const containerRef = useRef<View>(null);

  const options = 'options' in rest ? rest.options : undefined;
  const getTitle = 'options' in rest ? rest.getTitle : undefined;
  const onChange = 'options' in rest ? rest.onChange : undefined;
  const children = 'options' in rest ? undefined : rest.children;

  const onStartSelect = useCallback(() => {
    if (!showDropdown) {
      containerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        setContainerRect({ x: pageX, y: pageY, width, height });
        setShowDropdown(true);
      });
      return;
    }

    setShowDropdown(false);
  }, [showDropdown, setShowDropdown]);

  const onDismiss = useCallback(() => {
    setShowDropdown(false);
  }, [setShowDropdown]);

  const onSelect = useCallback(
    (value: string) => {
      setShowDropdown(false);
      onChange?.(value as T);
    },
    [onChange, setShowDropdown],
  );

  const optionElements = useMemo(
    () =>
      options
        ? options.map((option, index) => (
            <SelectOption
              key={option}
              value={option}
              title={getTitle?.(option, index)}
              onSelect={() => onSelect(option)}
            />
          ))
        : children,
    [children, getTitle, onSelect, options],
  );

  return (
    <SelectContext.Provider value={{ onSelect, value }}>
      <Container ref={containerRef}>
        <TouchableOpacity onPress={onStartSelect}>
          <SelectElement>
            <SelectText>
              {getTitle?.(value as T, options?.indexOf(value as T) ?? 0) ??
                value}
            </SelectText>
            <Layout.Icon name="chevron-down" size={16} />
          </SelectElement>
        </TouchableOpacity>
      </Container>
      <Modal transparent visible={showDropdown}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <Backdrop>
            {showDropdown && (
              <DropdownElement
                entering={FadeInUp.duration(250)}
                exiting={FadeOutUp.duration(250)}
                style={{
                  width: containerRect.width,
                  top: containerRect.y + containerRect.height,
                  left: containerRect.x,
                }}
              >
                {optionElements}
              </DropdownElement>
            )}
          </Backdrop>
        </TouchableWithoutFeedback>
      </Modal>
    </SelectContext.Provider>
  );
}

export default memo(Select);
