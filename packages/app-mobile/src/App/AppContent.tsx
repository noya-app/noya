import React, { useCallback } from 'react';
import styled from 'styled-components/native';

import { WorkspaceAction } from 'noya-state';
import { StateProvider } from 'noya-app-state-context/src/ApplicationStateContext';
import useAppState from '../hooks/useAppState';

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
        <Placeholder>It's working!</Placeholder>
      </ContentContainer>
    </StateProvider>
  );
};

export default AppContent;

const ContentContainer = styled.View((p) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: p.theme.colors.sidebar.background,
}));

const Placeholder = styled.Text((p) => ({
  fontSize: 24,
  color: p.theme.colors.text,
}));
