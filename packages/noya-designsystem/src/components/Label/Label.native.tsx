import React, { memo } from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

import { Layout } from '../Layout';
import { LabelRootProps } from './types';

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const LabelLabel = styled(Text)(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
  fontSize: 11,
  minWidth: 0,
  letterSpacing: 0.4,
}));

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const LabelContainer = styled(View)(({ theme }) => ({
  border: 0,
  minWidth: 0,
  alignItems: 'center',
}));

function LabelRoot({ label, children }: LabelRootProps) {
  return (
    <LabelContainer>
      {children}
      {label && (
        <>
          <Layout.Stack size={2} />
          <LabelLabel>{label}</LabelLabel>
        </>
      )}
    </LabelContainer>
  );
}

export const Label = memo(LabelLabel);
export const Root = memo(LabelRoot);
