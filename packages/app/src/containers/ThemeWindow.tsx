import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import LayerStylesGrid from '../components/theme/LayerStylesGrid';
import SwatchesGrid from '../components/theme/SwatchesGrid';

import styled from 'styled-components';

const Container = styled.main(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const LayerStyles = memo(function LayerStyles() {
  const [state, dispatch] = useApplicationState();

  return (
    <LayerStylesGrid
      sharedStyles={useSelector(Selectors.getSharedStyles)}
      selectedSharedStyleIds={state.selectedLayerStyleIds}
      onSelectSharedStyle={useCallback(
        (id, type) => {
          dispatch('selectLayerStyle', id, type);
        },
        [dispatch],
      )}
    />
  );
});

const Swatches = memo(function Swatches() {
  const [state, dispatch] = useApplicationState();

  return (
    <SwatchesGrid
      swatches={useSelector(Selectors.getSharedSwatches)}
      selectedSwatchIds={state.selectedSwatchIds}
      onSelectSwatch={useCallback(
        (id, type) => {
          dispatch('selectSwatch', id, type);
        },
        [dispatch],
      )}
    />
  );
});

export default memo(function ThemeWindow() {
  const componentsTab = useSelector(Selectors.getCurrentComponentsTab);

  const gridElement = useMemo(() => {
    switch (componentsTab) {
      case 'swatches':
        return <Swatches />;
      case 'textStyles':
        return <></>;
      case 'layerStyles':
        return <LayerStyles />;
      case 'symbols':
        return <></>;
    }
  }, [componentsTab]);

  return <Container>{gridElement}</Container>;
});
