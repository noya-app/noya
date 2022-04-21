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
  flex,
  size,
  label,
  children,
  labelPosition,
}: LabeledViewProps) {
  const labelContent = label ? (
    <StyledLabel>{label}</StyledLabel>
  ) : (
    <LabelPlaceholder />
  );

  const content =
    labelPosition === 'start' ? (
      <>
        {labelContent}
        {children}
      </>
    ) : (
      <>
        {children}
        {labelContent}
      </>
    );

  return (
    <Container flex={flex} size={size}>
      {content}
    </Container>
  );
});
