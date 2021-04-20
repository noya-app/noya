import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import LayerStylesGrid from '../components/theme/LayerStylesGrid';
import SwatchesGrid from '../components/theme/SwatchesGrid';
import useShallowArray from '../hooks/useShallowArray';
import styled from 'styled-components';

const Container = styled.main(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const LayerStyles = memo(function LayerStyles() {
  const [state, dispatch] = useApplicationState();

  const sharedStyles = useShallowArray(useSelector(Selectors.getSharedStyles));

  return (
    <LayerStylesGrid
      sharedStyles={sharedStyles}
      selectedThemeStyleIds={state.selectedLayerStyleIds}
      onSelectThemeStyle={useCallback(
        (id, type) => {
          dispatch('selectThemeStyle', id, type);
        },
        [dispatch],
      )}
      onDuplicateThemeStyle={useCallback(
        (id: string[]) => dispatch('duplicateThemeStyle', id),
        [dispatch],
      )}
      onDeleteThemeStyle={useCallback(() => dispatch('removeThemeStyle'), [
        dispatch,
      ])}
    />
  );
});

const Swatches = memo(function Swatches() {
  const [state, dispatch] = useApplicationState();

  const selectedGroup = state.selectedSwatchGroup;

  const swatches = useShallowArray(useSelector(Selectors.getSharedSwatches));

  const filterSwatches = useMemo(
    () => swatches.filter((swatch) => swatch.name.startsWith(selectedGroup)),
    [swatches, selectedGroup],
  );

  return (
    <SwatchesGrid
      swatches={filterSwatches}
      selectedSwatchIds={state.selectedSwatchIds}
      onGroupSwatch={useCallback(
        (id: string[], name?: string) => {
          dispatch('groupSwatches', id, name);
        },
        [dispatch],
      )}
      onDuplicateSwatch={useCallback(
        (id: string[]) => dispatch('duplicateColorSwatch', id),
        [dispatch],
      )}
      onDeleteSwatch={useCallback(() => {
        dispatch('removeSwatch');
      }, [dispatch])}
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
