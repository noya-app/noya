import React, { ForwardedRef, forwardRef, memo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import { FillPreviewBackground } from './FillPreviewBackground';
import { FillInputFieldProps } from './types';

const Container = styled(View)<{ flex?: number | string }>(({ flex }) => ({
  flex,
  width: 50,
  height: 27,
  borderRadius: 4,
  overflow: 'hidden',
  background: 'transparent',
}));

export default memo(
  forwardRef(function FillInputField(
    { id, value, ...rest }: FillInputFieldProps,
    ref: ForwardedRef<View>,
  ) {
    return (
      <Container {...rest}>
        <FillPreviewBackground value={value} />
      </Container>
    );
  }),
);
