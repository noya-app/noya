import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { View, ScrollView } from 'react-native';

import { WorkspaceAction, Selectors } from 'noya-state';
import { decodeFontName } from 'noya-fonts';
import { useDownloadFont, useFontManager } from 'noya-renderer';
import { StateProvider } from 'noya-app-state-context';
import { Expandable, ExpandableContextProvider } from 'noya-designsystem';
import { LayerList } from 'noya-workspace-ui';
import useAppState from '../hooks/useAppState';
import AttributeInspector from '../containers/AttributeInspector';
import ThemeManager from '../containers/ThemeManager';
import MainMenu from '../containers/MainMenu';
import PageList from '../containers/PageList';
import Toolbar from '../containers/Toolbar';
import Canvas from '../containers/Canvas';

const AppContent: React.FC<{}> = () => {
  const { state, dispatch } = useAppState();
  const [layersFilter, setLayersFilter] = useState('');
  const fontManager = useFontManager();

  const handleDispatch = useCallback(
    (action: WorkspaceAction) => {
      dispatch({ type: 'update', value: action });
    },
    [dispatch],
  );

  const downloadFont = useDownloadFont();

  // Whenever the sketch file updates, download any new fonts
  useEffect(() => {
    if (state.type !== 'success') return;

    const fontNames = Selectors.getAllFontNames(state.value.history.present);

    fontNames.forEach((fontName) => {
      const { fontFamily, fontTraits } = decodeFontName(fontName);
      const fontFamilyId = fontManager.getFontFamilyId(fontFamily);

      if (!fontFamilyId) return;

      downloadFont({ fontFamilyId, ...fontTraits });
    });
  }, [downloadFont, fontManager, state]);

  if (state.type !== 'success') {
    return null;
  }

  return (
    <ExpandableContextProvider>
      <StateProvider state={state.value} dispatch={handleDispatch}>
        <ContentContainer>
          <Expandable position="left">
            <MainMenu id="main-menu" icon="hamburger-menu" />
            <PageList id="page-list" icon="file" />
            <LayerList
              id="layers"
              icon="layers"
              filter={layersFilter}
              size={{ width: 350, height: 250 }}
            />
            <ThemeManager id="theme" icon="tokens" />
          </Expandable>
          <Expandable position="right">
            <AttributeInspector id="inspector" icon="backpack" />
          </Expandable>
          <Toolbar />
          <Canvas />
        </ContentContainer>
      </StateProvider>
    </ExpandableContextProvider>
  );
};

export default AppContent;

const ContentContainer = styled(View)((p) => ({
  flex: 1,
  position: 'relative',
  backgroundColor: p.theme.colors.sidebar.background,
}));
