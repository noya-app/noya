import { Selectors } from 'noya-state';
import { memo, useMemo, useCallback } from 'react';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { GroupIcon } from '@radix-ui/react-icons';
import { ListView, Spacer } from 'noya-designsystem';
import { sortBy } from 'noya-utils';
import styled from 'styled-components';
import useShallowArray from '../hooks/useShallowArray';
import { createThemeGroups } from '../utils/themeTree';
import Sketch from '@sketch-hq/sketch-file-format-ts';

const Container = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const Header = styled.div(({ theme }) => ({
  fontWeight: 500,
}));

type ContainerType = Sketch.Swatch | Sketch.SharedStyle | Sketch.SymbolMaster;

interface ContainerGroupProps {
  array: Array<ContainerType>;
  headerTitle: string;
  selectedGroup: string;
  onClick: (title: string) => void;
}

const ContainerGroup = memo(function ContainerGroup({
  array,
  onClick,
  headerTitle,
  selectedGroup,
}: ContainerGroupProps) {
  const groupArray = useShallowArray(array);

  const groups = useMemo(() => {
    const groups = createThemeGroups(groupArray);
    groups.shift();

    return sortBy(groups, 'path');
  }, [groupArray]);

  const groupElements = useMemo(
    () =>
      groups.map((group) => (
        <ListView.Row
          id={group.name}
          key={group.name}
          onClick={() => onClick(group.path)}
          selected={selectedGroup === group.path}
        >
          <Spacer.Horizontal size={16 * group.depth} />
          <GroupIcon />
          <Spacer.Horizontal size={8} />
          {group.name}
        </ListView.Row>
      )),
    [groups, selectedGroup, onClick],
  );

  return (
    <Container>
      <ListView.Root>
        <ListView.Row
          onClick={() => onClick('')}
          selected={selectedGroup === ''}
        >
          <Header>{`All Theme ${headerTitle}`}</Header>
        </ListView.Row>
        {groupElements}
      </ListView.Root>
    </Container>
  );
});

const SwatchesGroup = memo(() => {
  const [state, dispatch] = useApplicationState();
  const swatches = useSelector(Selectors.getSharedSwatches);

  return (
    <ContainerGroup
      array={swatches}
      headerTitle="Colors"
      onClick={useCallback(
        (title: string) => dispatch('setSelectedSwatchGroup', title),
        [dispatch],
      )}
      selectedGroup={state.selectedThemeTab.swatches.groupName}
    />
  );
});

const TextStylesGroup = memo(() => {
  const [state, dispatch] = useApplicationState();
  const textStyles = useSelector(Selectors.getSharedTextStyles);

  return (
    <ContainerGroup
      array={textStyles}
      headerTitle="Texts"
      onClick={useCallback(
        (title: string) => dispatch('setSelectedTextStyleGroup', title),
        [dispatch],
      )}
      selectedGroup={state.selectedThemeTab.textStyles.groupName}
    />
  );
});

const ThemeStylesGroup = memo(() => {
  const [state, dispatch] = useApplicationState();
  const styles = useSelector(Selectors.getSharedStyles);

  return (
    <ContainerGroup
      array={styles}
      headerTitle="Styles"
      onClick={useCallback(
        (title: string) => dispatch('setSelectedThemeStyleGroup', title),
        [dispatch],
      )}
      selectedGroup={state.selectedThemeTab.layerStyles.groupName}
    />
  );
});

const SymbolsGroup = memo(() => {
  const [state, dispatch] = useApplicationState();
  const symbols = useSelector(Selectors.getSymbols);

  return (
    <ContainerGroup
      array={symbols}
      headerTitle="Symbols"
      onClick={useCallback(
        (title: string) => dispatch('setSelectedSymbolGroup', title),
        [dispatch],
      )}
      selectedGroup={state.selectedThemeTab.symbols.groupName}
    />
  );
});

export default memo(function ThemeGroups() {
  const tab = useSelector(Selectors.getCurrentComponentsTab);

  const element = useMemo(() => {
    switch (tab) {
      case 'swatches':
        return <SwatchesGroup />;
      case 'textStyles':
        return <TextStylesGroup />;
      case 'layerStyles':
        return <ThemeStylesGroup />;
      case 'symbols':
        return <SymbolsGroup />;
    }
  }, [tab]);

  return <>{element}</>;
});
