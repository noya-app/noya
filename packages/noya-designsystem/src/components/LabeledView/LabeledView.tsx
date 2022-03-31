import React, { memo } from 'react';
import styled from 'styled-components';

import { LabeledViewProps } from './types';
import { Label } from '../Label';

const Container = styled.div<{ flex?: number; size?: number }>(
  ({ flex, size }) => ({
    display: 'flex',
    flexDirection: 'column',
    ...(!!flex && !size ? { flex: `${flex}` } : {}),
    ...(!flex && !!size ? { width: size } : {}),
  }),
);

const StyledLabel = styled(Label)({
  textAlign: 'center',
  height: 15,
});

const LabelPlaceholder = styled.div({
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
