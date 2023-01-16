import { DotsVerticalIcon } from 'noya-icons';
import React, { memo } from 'react';
import {
  Panel as ResizablePanel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import styled from 'styled-components';

const PanelElement = styled(ResizablePanel)({
  display: 'flex',
  position: 'relative',
  overflow: 'hidden',
});

const PanelGroupElement = styled(PanelGroup)({
  flex: '1',
  display: 'flex',
  overflow: 'hidden',
});

const ResizeHandleElement = styled(PanelResizeHandle)(({ theme }) => ({
  flex: '0 0 4px',
  position: 'relative',
  outline: 'none',
  background: theme.colors.dividerStrong,
  display: 'flex',
}));

const ContainerElement = styled.div({
  flex: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const DotsElement = styled(DotsVerticalIcon)(({ theme }) => ({
  color: theme.colors.icon,
  margin: '0 -4px',
}));

const ResizeHandle = memo(function ResizeHandle({
  onDoubleClick,
}: {
  onDoubleClick?: () => void;
}) {
  return (
    <ResizeHandleElement>
      <ContainerElement onDoubleClick={onDoubleClick}>
        <DotsElement />
      </ContainerElement>
    </ResizeHandleElement>
  );
});

export namespace Panel {
  export const Root = PanelGroupElement;
  export const Item = PanelElement;
  export const Handle = ResizeHandle;
}
