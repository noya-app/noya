import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import ThemeStylesGrid from '../components/theme/ThemeStylesGrid';
import TextStylesGrid from '../components/theme/TextStylesGrid';
import SwatchesGrid from '../components/theme/SwatchesGrid';
import SymbolsGrid from '../components/theme/SymbolsGrid';
import useShallowArray from '../hooks/useShallowArray';
import styled from 'styled-components';

const Container = styled.main(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const ThemeStyles = memo(function ThemeStyles() {
  const [state, dispatch] = useApplicationState();
  const selectedGroup = state.selectedTheme.layerStyles.groupName;

  const sharedStyles = useShallowArray(useSelector(Selectors.getSharedStyles));

  const filterTheme = useMemo(
    () => sharedStyles.filter((style) => style.name.startsWith(selectedGroup)),
    [sharedStyles, selectedGroup],
  );
  return (
    <ThemeStylesGrid
      sharedStyles={filterTheme}
      selectedThemeStyleIds={state.selectedTheme.layerStyles.ids}
      onGroupThemeStyle={useCallback(
        (id: string[], name?: string) => {
          dispatch('groupThemeStyle', id, name);
        },
        [dispatch],
      )}
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

  const selectedGroup = state.selectedTheme.swatches.groupName;

  const swatches = useShallowArray(useSelector(Selectors.getSharedSwatches));

  const filterSwatches = useMemo(
    () => swatches.filter((swatch) => swatch.name.startsWith(selectedGroup)),
    [swatches, selectedGroup],
  );

  return (
    <SwatchesGrid
      swatches={filterSwatches}
      selectedSwatchIds={state.selectedTheme.swatches.ids}
      onGroupSwatch={useCallback(
        (id: string[], name?: string) => {
          dispatch('groupSwatch', id, name);
        },
        [dispatch],
      )}
      onDuplicateSwatch={useCallback(
        (id: string[]) => dispatch('duplicateSwatch', id),
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

const TextStyles = memo(function TextStyles() {
  const [state, dispatch] = useApplicationState();

  const textStyles = useShallowArray(
    useSelector(Selectors.getSharedTextStyles),
  );

  const selectedGroup = state.selectedTheme.textStyles.groupName;
  const filterText = useMemo(
    () => textStyles.filter((item) => item.name.startsWith(selectedGroup)),
    [textStyles, selectedGroup],
  );

  return (
    <TextStylesGrid
      sharedStyles={filterText}
      selectedTextStyles={state.selectedTheme.textStyles.ids}
      onGroupTextStyle={useCallback(
        (id: string[], name?: string) => {
          dispatch('groupTextStyle', id, name);
        },
        [dispatch],
      )}
      onSelectTextStyle={useCallback(
        (id, type) => {
          dispatch('selectTextStyle', id, type);
        },
        [dispatch],
      )}
      onDuplicateTextStyle={useCallback(
        (id: string[]) => {
          dispatch('duplicateTextStyle', id);
        },
        [dispatch],
      )}
      onDeleteTextStyle={useCallback(() => dispatch('removeTextStyle'), [
        dispatch,
      ])}
    />
  );
});

const Symbols = memo(function Symbols() {
  const [state, dispatch] = useApplicationState();

  const symbols = useShallowArray(useSelector(Selectors.getSymbols));
  const selectedGroup = state.selectedTheme.symbols.groupName;
  const filterSymbols = useMemo(
    () => symbols.filter((item) => item.name.startsWith(selectedGroup)),
    [symbols, selectedGroup],
  );

  return (
    <SymbolsGrid
      symbols={filterSymbols}
      selectedSymbolsIds={state.selectedTheme.symbols.ids}
      onSelectSymbol={useCallback(
        (id, type) => {
          dispatch('selectSymbol', id, type);
        },
        [dispatch],
      )}
      onGroupSymbol={useCallback(
        (id: string[], name?: string) => {
          dispatch('groupSymbol', id, name);
        },
        [dispatch],
      )}
      onDeleteSymbol={useCallback(
        (id: string[]) => dispatch('deleteSymbol', id),
        [dispatch],
      )}
      onDuplicateSymbol={useCallback(
        (id: string[]) => dispatch('duplicateLayer', id),
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
        return <TextStyles />;
      case 'layerStyles':
        return <ThemeStyles />;
      case 'symbols':
        return <Symbols />;
    }
  }, [componentsTab]);

  return <Container>{gridElement}</Container>;
});
