import { sortBy } from '@noya-app/noya-utils';
import { useShallowArray } from '@noya-app/react-utils';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import { TreeView } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { GroupIcon } from 'noya-icons';
import { Selectors } from 'noya-state';
import { createThemeGroups } from 'noya-theme-editor';
import React, { memo, useCallback, useMemo } from 'react';

type ThemeGroupType = Sketch.Swatch | Sketch.SharedStyle | Sketch.SymbolMaster;

interface ThemeGroupProps {
  items: Array<ThemeGroupType>;
  title: string;
  selectedGroup: string;
  onClick: (title: string) => void;
}

const ThemeGroup = memo(function ThemeGroup({
  items,
  onClick,
  title,
  selectedGroup,
}: ThemeGroupProps) {
  const groupArray = useShallowArray(items);

  const groups = useMemo(() => {
    const groups = createThemeGroups(groupArray);

    groups[0].name = `Theme ${title}`;

    return sortBy(groups, 'path');
  }, [groupArray, title]);

  return (
    <TreeView.Root scrollable>
      {groups.map((group) => {
        const isRoot = group.path === '';

        return (
          <TreeView.Row
            id={group.name}
            key={group.name}
            depth={group.depth}
            isSectionHeader={isRoot}
            onPress={() => onClick(group.path)}
            selected={selectedGroup === group.path}
            icon={!isRoot && <GroupIcon />}
          >
            {group.name}
          </TreeView.Row>
        );
      })}
    </TreeView.Root>
  );
});

const SwatchesGroup = memo(() => {
  const [state, dispatch] = useApplicationState();
  const swatches = useSelector(Selectors.getSharedSwatches);

  return (
    <ThemeGroup
      items={swatches}
      title="Colors"
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
    <ThemeGroup
      items={textStyles}
      title="Text Styles"
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
    <ThemeGroup
      items={styles}
      title="Styles"
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
    <ThemeGroup
      items={symbols}
      title="Symbols"
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
});
