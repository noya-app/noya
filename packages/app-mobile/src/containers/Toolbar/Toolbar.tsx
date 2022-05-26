import React, { memo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import { Layout } from 'noya-designsystem';
import HistoryMenu from './HistoryMenu';
import CursorMenu from './CursorMenu';
import ToolsMenu from './ToolsMenu';
import ZoomMenu from './ZoomMenu';

const Toolbar: React.FC = () => {
  return (
    <ToolbarView pointerEvents="box-none">
      <ToolbarContainer>
        <HistoryMenu />
        <Layout.Queue size="large" />
        <CursorMenu />
        <Layout.Queue size="large" />
        <ToolsMenu />
        <Layout.Queue size="large" />
        <ZoomMenu />
      </ToolbarContainer>
    </ToolbarView>
  );
};

export default memo(Toolbar);

const ToolbarView = styled(View)({
  top: 10,
  zIndex: 100,
  width: '100%',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
});

const ToolbarContainer = styled(View)((p) => ({
  flexDirection: 'row',
  borderRadius: 8,
  padding: p.theme.sizes.spacing.small,
  backgroundColor: p.theme.colors.sidebar.background,
}));
