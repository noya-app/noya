import React, { memo, ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';
import { LayoutChangeEvent, View } from 'react-native';

import { Size } from 'noya-geometry';
import CanvasViewer from '../CanvasViewer';

const Container = styled(View)<{ backgroundColor?: string }>(
  ({ backgroundColor }) => ({
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...(backgroundColor && { backgroundColor }),
  }),
);

const Inner = styled(View)({
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

function CanvasGridItem({ renderContent, background }: Props) {
  const [size, setSize] = useState<Size | undefined>(undefined);

  const renderer = useCallback(
    () => (size ? renderContent(size) : null),
    [renderContent, size],
  );

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  }, []);

  // Constant height of CanvasViewer is hack to prevent
  // native crashes on SkCanvas.drawPicture
  // caused by trying to render the picture outside of parent box
  // durning resizing of the preview viewport

  return (
    <Container backgroundColor={background} onLayout={onContainerLayout}>
      <Inner>
        {size && (
          <CanvasViewer
            width={size.width}
            height={1000}
            renderContent={renderer}
          />
        )}
      </Inner>
    </Container>
  );
}

export default memo(CanvasGridItem);
