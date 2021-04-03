import { useSelector } from '../contexts/ApplicationStateContext';
import { Selectors } from 'noya-state';
import { memo, useMemo } from 'react';
import LayerStylesGrid from './LayerStylesGrid';
import SwatchesGrid from './SwatchesGrid';

import styled from 'styled-components';

const Container = styled.main(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

export default memo(function ComponentsWindow() {
  const componentsTab = useSelector(Selectors.getCurrentComponentsTab);

  const gridElement = useMemo(() => {
    switch (componentsTab) {
      case 'swatches':
        return <SwatchesGrid />;
      case 'textStyles':
        return <></>;
      case 'layerStyles':
        return <LayerStylesGrid />;
      case 'symbols':
        return <></>;
    }
  }, [componentsTab]);

  return <Container>{gridElement}</Container>;
});
