import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import { WorkspaceAction, Selectors } from 'noya-state';
import { decodeFontName } from 'noya-fonts';
import { useDownloadFont, useFontManager } from 'noya-renderer';
import { StateProvider } from 'noya-app-state-context';
import useAppState from '../hooks/useAppState';
import LayerList from '../containers/LayerList';
import Toolbar from '../containers/Toolbar';
import Canvas from '../containers/Canvas';

const AppContent: React.FC<{}> = () => {
  const [showLayerList, setShowLayerList] = useState(false);
  const { state, dispatch } = useAppState();
  const fontManager = useFontManager();

  const handleDispatch = useCallback(
    (action: WorkspaceAction) => {
      dispatch({ type: 'update', value: action });
    },
    [dispatch],
  );

  const onToggleLayerList = useCallback(() => {
    if (showLayerList) {
      setShowLayerList(false);
    } else {
      setShowLayerList(true);
    }
  }, [showLayerList]);

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
    <StateProvider state={state.value} dispatch={handleDispatch}>
      <ContentContainer>
        <Toolbar onToggleLayerList={onToggleLayerList} />
        <Canvas />
        {showLayerList && <LayerList />}
      </ContentContainer>
    </StateProvider>
  );
};

export default AppContent;

const ContentContainer = styled(View)((p) => ({
  flex: 1,
  backgroundColor: p.theme.colors.sidebar.background,
  position: 'relative',
}));
