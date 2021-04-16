import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  useSelector,
  useApplicationState,
} from '../contexts/ApplicationStateContext';
import { memo, useMemo, useCallback } from 'react';
import { GroupIcon, MaskOnIcon } from '@radix-ui/react-icons';
import styled from 'styled-components';
import { ListView, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import useShallowArray from '../hooks/useShallowArray';

const Container = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const Header = styled.div(({ theme }) => ({
  fontWeight: 600,
}));

const sortArray = (array: any[], key: string) =>
  [...array].sort((a, b) => {
    const aName = a[key].toUpperCase();
    const bName = b[key].toUpperCase();

    return aName > bName ? 1 : aName < bName ? -1 : 0;
  });

type SwatchGroup = {
  name: string;
  swatches: Sketch.Swatch[];
  children?: SwatchGroup[];
};

type SwatchTitles = {
  name: string;
  full: string;
  depth: number;
};

function createSwatchTree(swatches: Sketch.Swatch[]): SwatchGroup {
  const root: SwatchGroup = {
    name: '',
    swatches: [],
    children: [],
  };

  function getGroup(pathComponents: string[]): SwatchGroup {
    let group = root;
    while (pathComponents.length > 0) {
      const component = pathComponents.shift()!;
      if (!group.children) continue;

      const existing = group.children.find((group) => group.name === component);
      if (existing) {
        group = existing;
      } else {
        const newGroup = {
          name: component,
          swatches: [],
          children: [],
        };
        group.children.push(newGroup);
        group = newGroup;
      }
    }
    return group;
  }
  swatches.forEach((swatch) => {
    const pathComponents = swatch.name.split('/');
    const parent = getGroup(pathComponents.slice(0, -1));
    parent.swatches.push(swatch);
  });
  return root;
}

function flatten(
  swatch: SwatchGroup,
  parent: string,
  depth: number,
): SwatchTitles[] {
  const full = (parent ? parent + '/' : '') + swatch.name;

  return Array.prototype.concat.apply(
    {
      name: swatch.name,
      full: full,
      depth: depth,
    },
    swatch.children?.map((x) => flatten(x, full, depth + 1)) || [],
  );
}

export default memo(function SwatchesGroups() {
  const [state, dispatch] = useApplicationState();

  const swatches = useShallowArray(useSelector(Selectors.getSharedSwatches));
  const selectedGroup = state.selectedGroupSwatch;

  const flatSwatchGroup = useMemo(() => {
    const flat = flatten(createSwatchTree(swatches), '', -1);
    flat.shift();

    return sortArray(flat, 'full');
  }, [swatches]);

  const handleClick = useCallback(
    (title: string = '') => dispatch('setSelectedSwatchGroup', title),
    [dispatch],
  );

  const groupElements = useMemo(
    () =>
      flatSwatchGroup.map((group) => (
        <ListView.Row
          id={group.name}
          key={group.name}
          onClick={() => handleClick(group.full)}
          selected={selectedGroup === group.full}
        >
          <Spacer.Horizontal size={16 * group.depth} />
          {group.depth === 1 ? <GroupIcon /> : <MaskOnIcon />}
          <Spacer.Horizontal size={8} />
          {group.name}
        </ListView.Row>
      )),
    [flatSwatchGroup, selectedGroup, handleClick],
  );

  return (
    <Container>
      <ListView.Root>
        <ListView.Row
          id={'All Color Variables'}
          onClick={() => handleClick()}
          selected={selectedGroup === ''}
        >
          <Header>{'All Color Variables'}</Header>
        </ListView.Row>
        {groupElements}
      </ListView.Root>
    </Container>
  );
});
