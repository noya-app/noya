import { Size } from 'noya-geometry';
import React, { memo, ReactNode, useCallback, useRef } from 'react';
import styled from 'styled-components';
import CanvasViewer from '../../containers/CanvasViewer';
import { useSize } from '../../hooks/useSize';

const Container = styled.div<{ backgroundColor?: string }>(
  ({ backgroundColor }) => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...(backgroundColor && { backgroundColor }),
  }),
);

const Inner = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

interface Props {
  renderContent: (size: Size) => ReactNode;
  backgroundColor?: string;
}

export default memo(function CanvasGridItem({
  renderContent,
  backgroundColor,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(containerRef);
  const renderer = useCallback(() => (size ? renderContent(size) : null), [
    renderContent,
    size,
  ]);

  return (
    <Container ref={containerRef} backgroundColor={backgroundColor}>
      <Inner>
        {size && (
          <CanvasViewer
            width={size.width}
            height={size.height}
            renderContent={renderer}
          />
        )}
      </Inner>
    </Container>
  );
});
