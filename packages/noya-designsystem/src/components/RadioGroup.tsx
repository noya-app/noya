import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import React, { ComponentProps, memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { Tooltip } from './Tooltip';

const StyledRoot = styled(ToggleGroupPrimitive.Root)(({ theme }) => ({
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
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
  display: 'flex',
  alignItems: 'stretch',
  minHeight: '27px',
}));

const StyledItem = styled(ToggleGroupPrimitive.Item)(({ theme }) => ({
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
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
  '&[aria-checked="true"]': {
    backgroundColor: theme.colors.primary,
    color: 'white',
  },
}));

interface Props {
  value: string;
  tooltip?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

function ToggleGroupItem({
  value,
  tooltip,
  children,
  disabled = false,
}: Props) {
  const itemElement = (
    <StyledItem value={value} disabled={disabled}>
      {children}
    </StyledItem>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{itemElement}</Tooltip>
  ) : (
    itemElement
  );
}

function ToggleGroupRoot({
  onValueChange,
  ...props
}: Omit<ComponentProps<typeof StyledRoot>, 'type'>) {
  return (
    <StyledRoot
      {...props}
      type="single"
      onValueChange={useCallback(
        (value: string) => {
          if (!value) return;
          onValueChange?.(value);
        },
        [onValueChange],
      )}
    />
  );
}

export namespace RadioGroup {
  export const Root = memo(ToggleGroupRoot);
  export const Item = memo(ToggleGroupItem);
}
