import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  memo,
  useState,
} from 'react';
import styled from 'styled-components';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

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
  position: 'absolute',
  backgroundColor: 'rgb(30, 30, 30)',
  width: '100%',
  top: 5,
  borderRadius: 4,
  paddingVertical: 4,
}));

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

  const options = 'options' in rest ? rest.options : undefined;
  const getTitle = 'options' in rest ? rest.getTitle : undefined;
  const onChange = 'options' in rest ? rest.onChange : undefined;
  const children = 'options' in rest ? undefined : rest.children;

  const onStartSelect = useCallback(() => {
    setShowDropdown(!showDropdown);
  }, [showDropdown, setShowDropdown]);

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
      <Container>
        <TouchableOpacity onPress={onStartSelect}>
          <SelectElement>
            <SelectText>{value}</SelectText>
            <Layout.Icon name="chevron-down" size={16} />
          </SelectElement>
        </TouchableOpacity>
        <View>
          {showDropdown && (
            <DropdownElement
              entering={FadeInUp.duration(250)}
              exiting={FadeOutUp.duration(250)}
            >
              {optionElements}
            </DropdownElement>
          )}
        </View>
      </Container>
    </SelectContext.Provider>
  );
}

export default memo(Select);
