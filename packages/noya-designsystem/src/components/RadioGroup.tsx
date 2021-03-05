import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { memo, ReactNode } from 'react';
import styled from 'styled-components';
import { Tooltip } from '..';

const RadioRoot = styled(RadixRadioGroup.Root)(({ theme }) => ({
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
}));

const StyledItem = styled(RadixRadioGroup.Item)(({ theme }) => ({
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
}));

const StyledIndicator = styled(RadixRadioGroup.Indicator)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.primary,
  height: '100%',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
  color: 'white',
}));

const IndicatorContainer = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
});

interface Props {
  value: string;
  tooltip?: ReactNode;
  children: ReactNode;
}

function RadioItem({ value, tooltip, children }: Props) {
  const itemElement = (
    <StyledItem value={value}>
      {children}
      <IndicatorContainer>
        <StyledIndicator>{children}</StyledIndicator>
      </IndicatorContainer>
    </StyledItem>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{itemElement}</Tooltip>
  ) : (
    itemElement
  );
}

export const Root = RadioRoot;
export const Item = memo(RadioItem);
