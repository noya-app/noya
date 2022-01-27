import React, { useCallback } from 'react';
import styled from 'styled-components/native';

import { WorkspaceAction } from 'noya-state';
import { StateProvider } from 'noya-app-state-context';
import useAppState from '../hooks/useAppState';
import Toolbar from '../containers/Toolbar';
import Canvas from '../containers/Canvas';

const AppContent: React.FC<{}> = () => {
  const { state, dispatch } = useAppState();

  const handleDispatch = useCallback(
    (action: WorkspaceAction) => {
      dispatch({ type: 'update', value: action });
    },
    [dispatch],
  );

  if (state.type !== 'success') {
    return null;
  }

  return (
    <StateProvider state={state.value} dispatch={handleDispatch}>
      <ContentContainer>
        <Toolbar />
        <Canvas />
      </ContentContainer>
    </StateProvider>
  );
};

export default AppContent;

const ContentContainer = styled.View((p) => ({
  flex: 1,
  backgroundColor: p.theme.colors.sidebar.background,
  position: 'relative',
}));
