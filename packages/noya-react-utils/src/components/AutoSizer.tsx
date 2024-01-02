import { Size } from '@noya-app/noya-geometry';
import { useSize } from 'noya-react-utils';
import React, { memo, ReactNode, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  flex: '1 0 0',
  flexDirection: 'column',
});

interface Props {
  children: (size: Size) => ReactNode;
}

export const AutoSizer = memo(function AutoSizer({ children }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerSize = useSize(containerRef);

  return (
    <Container ref={containerRef}>
      {containerSize &&
        containerSize.width > 0 &&
        containerSize.height > 0 &&
        children(containerSize)}
    </Container>
  );
});
