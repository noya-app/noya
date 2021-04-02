import { useSelector } from '../contexts/ApplicationStateContext';
import { GridView } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo } from 'react';
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

  return (
    <Container>
      {componentsTab === 'swatches' && <SwatchesGrid />}
      {componentsTab === 'textStyles' && (
        <GridView.Root onClick={() => {}}></GridView.Root>
      )}
      {componentsTab === 'layerStyles' && <LayerStylesGrid />}
      {componentsTab === 'symbols' && (
        <GridView.Root onClick={() => {}}></GridView.Root>
      )}
    </Container>
  );
});
