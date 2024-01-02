import { Size } from '@noya-app/noya-geometry';
import { useSize } from '@noya-app/react-utils';
import { CanvasViewer } from 'noya-canvas-preview';
import React, { memo, ReactNode, useCallback, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ background?: string }>(({ background }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  ...(background && { background }),
}));

const Inner = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

interface Props {
  renderContent: (size: Size) => ReactNode;
  background?: string;
}

export const CanvasPreviewItem = memo(function CanvasPreviewItem({
  renderContent,
  background,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(containerRef);
  const renderer = useCallback(
    () => (size ? renderContent(size) : null),
    [renderContent, size],
  );

  return (
    <Container ref={containerRef} background={background}>
      <Inner>
        {size && <CanvasViewer size={size} renderContent={renderer} />}
      </Inner>
    </Container>
  );
});
