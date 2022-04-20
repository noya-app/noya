import React, {
  memo,
  useMemo,
  useContext,
  useCallback,
  createContext,
} from 'react';
import styled from 'styled-components';
import { TouchableOpacity, View } from 'react-native';

import type { RadioGroupItemProps, RadioGroupRootProps } from './types';

interface RadioContextType {
  value: string;
  onValueChange: (value?: string) => void;
}

const RadioContext = createContext<RadioContextType>({
  value: '',
  onValueChange: () => {},
});

const StyledRoot = styled(View)(({ theme }) => ({
  flex: 1,
  flexDirection: 'row',
  backgroundColor: theme.colors.inputBackground,
  borderRadius: 4,
  alignItems: 'stretch',
}));

const StyledItem = styled(View)<{ isActive: boolean }>(
  ({ theme, isActive }) => ({
    flex: 1,
    borderRadius: 4,
    backgroundColor: isActive ? theme.colors.primary : 'transparent',
  }),
);

const Touchable = styled(TouchableOpacity)({
  flex: 1,
});

const StyledItemInner = styled(View)({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

function ToggleGroupItem({ value, children, disabled }: RadioGroupItemProps) {
  const { value: currentValue, onValueChange } = useContext(RadioContext);

  const isActive = useMemo(() => value === currentValue, [value, currentValue]);

  const onPress = useCallback(() => {
    onValueChange(value);
  }, [onValueChange, value]);

  return (
    <StyledItem isActive={isActive}>
      <Touchable onPress={onPress} disabled={disabled}>
        <StyledItemInner>{children}</StyledItemInner>
      </Touchable>
    </StyledItem>
  );
}

function ToogleGroupRoot({
  children,
  value,
  onValueChange,
}: RadioGroupRootProps) {
  const onValueChangeCallback = useCallback(
    (value?: string) => {
      if (!value) {
        return;
      }

      onValueChange(value);
    },
    [onValueChange],
  );

  return (
    <RadioContext.Provider
      value={{ value, onValueChange: onValueChangeCallback }}
    >
      <StyledRoot>{children}</StyledRoot>
    </RadioContext.Provider>
  );
}

export const Root = memo(ToogleGroupRoot);
export const Item = memo(ToggleGroupItem);
