import React, { memo } from 'react';
import { View } from 'react-native';
import styled from 'styled-components';

import { LabeledViewProps } from './types';
import { Label } from '../Label';

const Container = styled(View)<{ flex?: number; size?: number }>(
  ({ flex, size }) => ({
    ...(!!flex && !size ? { flex } : {}),
    ...(!flex && !!size ? { width: size } : {}),
  }),
);

const StyledLabel = styled(Label)({
  textAlign: 'center',
  height: 15,
});

const LabelPlaceholder = styled(View)({
  height: 16,
});

export default memo(function LabeledView({
  label,
  children,
  flex,
  size,
}: LabeledViewProps) {
  return (
    <Container flex={flex} size={size}>
      {children}
      {label ? <StyledLabel>{label}</StyledLabel> : <LabelPlaceholder />}
    </Container>
  );
});
