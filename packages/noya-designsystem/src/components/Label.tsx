import React, { memo, ReactNode } from 'react';
import styled from 'styled-components';
import * as Spacer from '../components/Spacer';

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const LabelLabel = styled.label<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    ...theme.textStyles.small,
    color: theme.colors.textMuted,
    ...(selected && {
      color: theme.colors.text,
    }),
    fontSize: '11px',
    flex: '0 0 auto',
    minWidth: '0',
    letterSpacing: '0.4px',
    whiteSpace: 'pre', // prevent breaking - may need to make this an option
  }),
);

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const LabelContainer = styled.span(({ theme }) => ({
  flex: '0 0 auto',
  position: 'relative',
  border: '0',
  outline: 'none',
  minWidth: '0',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

interface LabelRootProps {
  label: ReactNode;
  children: ReactNode;
}

function LabelRoot({ label, children }: LabelRootProps) {
  return (
    <LabelContainer>
      {children}
      {label && (
        <>
          <Spacer.Vertical size={2} />
          <LabelLabel>{label}</LabelLabel>
        </>
      )}
    </LabelContainer>
  );
}

export const Label = memo(LabelLabel);
export const Root = memo(LabelRoot);
