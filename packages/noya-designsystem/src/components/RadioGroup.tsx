import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import React, {
  ComponentProps,
  createContext,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import styled from 'styled-components';
import { Tooltip } from './Tooltip';

type RadioGroupColorScheme = 'primary' | 'secondary';

const ignoredProps = new Set(['colorScheme']);

const StyledRoot = styled(ToggleGroupPrimitive.Root).withConfig({
  shouldForwardProp: (prop) => !ignoredProps.has(prop),
})<{
  colorScheme?: RadioGroupColorScheme;
}>(({ theme, colorScheme }) => ({
  appearance: 'none',
  width: '0px', // Reset intrinsic width
  flex: '1 1 0px',
  position: 'relative',
  border: '0',
  outline: 'none',
  minWidth: '0',
  textAlign: 'left',
  alignSelf: 'stretch',
  borderRadius: '4px',
  background: theme.colors.inputBackground,
  '&:focus': {
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${
      theme.colors[colorScheme ?? 'primary']
    }`,
  },
  display: 'flex',
  alignItems: 'stretch',
  minHeight: '27px',
  padding: colorScheme === undefined ? '2px' : 0,
}));

const StyledItem = styled(ToggleGroupPrimitive.Item).withConfig({
  shouldForwardProp: (prop) => !ignoredProps.has(prop),
})<{
  colorScheme?: RadioGroupColorScheme;
}>(({ theme, colorScheme }) => ({
  position: 'relative',
  flex: '1 1 0',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: 'rgb(139, 139, 139)',
  padding: 0,
  margin: 0,
  borderRadius: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
  '&[aria-checked="true"]': {
    backgroundColor: colorScheme
      ? theme.colors[colorScheme]
      : theme.colors.radioGroup.background,
    color: colorScheme ? theme.colors.radioGroup.background : theme.colors.text,
    boxShadow: colorScheme ? undefined : `0 1px 1px rgba(0,0,0,0.1)`,
  },
  '&:focus': {
    outline: 'none',
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${
      theme.colors[colorScheme ?? 'primary']
    }`,
  },
}));

interface ItemProps {
  value: string;
  tooltip?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

const ToggleGroupItem = forwardRef(function ToggleGroupItem(
  { value, tooltip, children, disabled = false }: ItemProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { colorScheme } = useContext(RadioGroupContext);

  const itemElement = (
    <StyledItem
      ref={forwardedRef}
      value={value}
      disabled={disabled}
      colorScheme={colorScheme}
    >
      {children}
    </StyledItem>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{itemElement}</Tooltip>
  ) : (
    itemElement
  );
});

type RadioGroupContextValue = {
  colorScheme?: RadioGroupColorScheme;
};

const RadioGroupContext = createContext<RadioGroupContextValue>({
  colorScheme: 'primary',
});

interface Props {
  id?: string;
  value?: string;
  onValueChange?: ComponentProps<typeof StyledRoot>['onValueChange'];
  colorScheme?: RadioGroupColorScheme;
  allowEmpty?: boolean;
  children: ReactNode;
}

function ToggleGroupRoot({
  id,
  value,
  onValueChange,
  colorScheme,
  allowEmpty,
  children,
}: Props) {
  const contextValue = useMemo(() => ({ colorScheme }), [colorScheme]);

  const handleValueChange = useCallback(
    (value: string) => {
      if (!allowEmpty && !value) return;
      onValueChange?.(value);
    },
    [allowEmpty, onValueChange],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <StyledRoot
        id={id}
        type="single"
        value={value}
        colorScheme={colorScheme}
        onValueChange={handleValueChange}
      >
        {children}
      </StyledRoot>
    </RadioGroupContext.Provider>
  );
}

export namespace RadioGroup {
  export const Root = memo(ToggleGroupRoot);
  export const Item = memo(ToggleGroupItem);
}
