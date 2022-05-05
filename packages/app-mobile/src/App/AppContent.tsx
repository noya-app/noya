import React, { useMemo, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import { WorkspaceAction, Selectors } from 'noya-state';
import { decodeFontName } from 'noya-fonts';
import {
  useDownloadFont,
  useFontManager,
  ImageCacheProvider,
} from 'noya-renderer';
import { StateProvider } from 'noya-app-state-context';
import { Expandable, ExpandableProvider } from 'noya-designsystem';
import { LayerList, DialogProvider } from 'noya-workspace-ui';
import { PortalProvider } from 'noya-react-utils';
import useAppState from '../hooks/useAppState';
import AttributeInspector from '../containers/AttributeInspector';
import ThemeManager from '../containers/ThemeManager';
import MainMenu from '../containers/MainMenu';
import PageList from '../containers/PageList';
import Toolbar from '../containers/Toolbar';
import Canvas from '../containers/Canvas';
import { registerKeyCommand } from '../utils/KeyCommandRegistry';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [layersFilter] = useState('');
  const fontManager = useFontManager();

  const handleDispatch = useCallback(
    (action: WorkspaceAction) => {
      dispatch({ type: 'update', value: action });
    },
    [dispatch],
  );

  const downloadFont = useDownloadFont();

  useEffect(() => {
    return registerKeyCommand({ command: 'command-p', title: 'Print' }, () => {
      // eslint-disable-next-line no-console
      console.log('Print!');
    });
  }, []);

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

  const expandableLeft = useMemo(() => {
    return (
      <Expandable
        position="left"
        items={[
          { name: 'menu', icon: 'hamburger-menu', content: <MainMenu /> },
          { name: 'pageList', icon: 'file', content: <PageList /> },
          {
            name: 'layerList',
            icon: 'layers',
            content: (
              <LayerList
                filter={layersFilter}
                size={{ width: 350, height: 250 }}
              />
            ),
          },
          { name: 'themeManager', icon: 'tokens', content: <ThemeManager /> },
        ]}
      />
    );
  }, [layersFilter]);

  const expandableRight = useMemo(() => {
    return (
      <Expandable
        position="right"
        items={[
          {
            name: 'inspector',
            icon: 'backpack',
            content: <AttributeInspector />,
          },
        ]}
      />
    );
  }, []);

  if (state.type !== 'success') {
    return null;
  }

  return (
    <DialogProvider>
      <ImageCacheProvider>
        <ExpandableProvider>
          <StateProvider state={state.value} dispatch={handleDispatch}>
            <PortalProvider>
              <ContentContainer>
                {expandableLeft}
                {expandableRight}
                <Toolbar />
                <Canvas />
              </ContentContainer>
            </PortalProvider>
          </StateProvider>
        </ExpandableProvider>
      </ImageCacheProvider>
    </DialogProvider>
  );
};

export default AppContent;

const ContentContainer = styled(View)((p) => ({
  flex: 1,
  position: 'relative',
  backgroundColor: p.theme.colors.sidebar.background,
  flexDirection: 'row',
}));
