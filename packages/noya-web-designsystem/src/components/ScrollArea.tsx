import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import { ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';

const SCROLLBAR_SIZE = 10;

const StyledScrollArea = styled(RadixScrollArea.Root)({
  width: '100%',
  height: '100%',
});

const StyledViewport = styled(RadixScrollArea.Viewport)({
  width: '100%',
  height: '100%',
  // Override the `display: table` in the child, since this allows
  // elements to expand beyond the width of the viewport.
  '& > div': {
    display: 'block !important',
  },
});

const StyledScrollbar = styled(RadixScrollArea.Scrollbar)({
  display: 'flex',
  padding: '3px',
  '&[data-orientation="vertical"]': {
    width: SCROLLBAR_SIZE,
  },
});

const StyledThumb = styled(RadixScrollArea.Thumb)(({ theme }) => ({
  flex: 1,
  borderRadius: SCROLLBAR_SIZE,
  backgroundColor: theme.colors.scrollbar,
}));

const Container = styled.div({
  flex: '1 1 0px',
  minHeight: 0,
});

interface Props {
  children?: ReactNode | ((scrollElementRef: HTMLDivElement) => ReactNode);
}

export default function ScrollArea({ children }: Props) {
  const [scrollElementRef, setScrollElementRef] =
    useState<HTMLDivElement | null>(null);

  return (
    <Container>
      <StyledScrollArea>
        <StyledViewport
          ref={useCallback((ref) => setScrollElementRef(ref), [])}
        >
          {typeof children === 'function'
            ? scrollElementRef
              ? children(scrollElementRef)
              : null
            : children}
        </StyledViewport>
        <StyledScrollbar orientation="vertical" className="scroll-component">
          <StyledThumb className="scroll-component" />
        </StyledScrollbar>
      </StyledScrollArea>
    </Container>
  );
}
