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

type RadioGroupVariant = 'primary' | 'secondary';

const StyledRoot = styled(ToggleGroupPrimitive.Root)<{
  variant?: RadioGroupVariant;
}>(({ theme, variant = 'primary' }) => ({
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
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors[variant]}`,
  },
  display: 'flex',
  alignItems: 'stretch',
  minHeight: '27px',
}));

const StyledItem = styled(ToggleGroupPrimitive.Item)<{
  variant?: RadioGroupVariant;
}>(({ theme, variant = 'primary' }) => ({
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
  '&:focus': {
    outline: 'none',
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors[variant]}`,
  },
  '&[aria-checked="true"]': {
    backgroundColor: theme.colors[variant],
    color: 'white',
  },
}));

interface Props {
  value: string;
  tooltip?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

const ToggleGroupItem = forwardRef(function ToggleGroupItem(
  { value, tooltip, children, disabled = false }: Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { variant } = useContext(RadioGroupContext);

  const itemElement = (
    <StyledItem
      ref={forwardedRef}
      value={value}
      disabled={disabled}
      variant={variant}
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
  variant: RadioGroupVariant;
};

const RadioGroupContext = createContext<RadioGroupContextValue>({
  variant: 'primary',
});

function ToggleGroupRoot({
  onValueChange,
  variant,
  allowEmpty,
  ...props
}: Omit<ComponentProps<typeof StyledRoot>, 'type'> & {
  allowEmpty?: boolean;
}) {
  const contextValue = useMemo(() => ({ variant }), [variant]);

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <StyledRoot
        {...props}
        type="single"
        onValueChange={useCallback(
          (value: string) => {
            if (!allowEmpty && !value) return;
            onValueChange?.(value);
          },
          [allowEmpty, onValueChange],
        )}
      />
    </RadioGroupContext.Provider>
  );
}

export namespace RadioGroup {
  export const Root = memo(ToggleGroupRoot);
  export const Item = memo(ToggleGroupItem);
}
