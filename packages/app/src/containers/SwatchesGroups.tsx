import {
  useSelector,
  useApplicationState,
} from '../contexts/ApplicationStateContext';
import { memo, useMemo, useCallback } from 'react';
import { GroupIcon } from '@radix-ui/react-icons';
import styled from 'styled-components';
import { ListView, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import useShallowArray from '../hooks/useShallowArray';
import { SwatchGroup, createSwatchTree } from '../utils/createSwatchTree';
import { sortBy } from 'noya-utils';

const Container = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const Header = styled.div(({ theme }) => ({
  fontWeight: 600,
}));

type SwatchTitles = {
  name: string;
  path: string;
  depth: number;
};

function flatten(
  SwatchGroup: SwatchGroup,
  parent: string,
  depth: number,
): SwatchTitles[] {
  const path = (parent ? parent + '/' : '') + SwatchGroup.name;

  return [
    {
      name: SwatchGroup.name,
      path: path,
      depth: depth,
    },
    ...SwatchGroup.children.flatMap((x) => flatten(x, path, depth + 1)),
  ];
}

export default memo(function SwatchesGroups() {
  const [state, dispatch] = useApplicationState();

  const swatches = useShallowArray(useSelector(Selectors.getSharedSwatches));
  const selectedGroup = state.selectedSwatchGroup;

  const flatSwatchGroup = useMemo(() => {
    const flat = flatten(createSwatchTree(swatches), '', -1);
    flat.shift();

    return sortBy(flat, 'path');
  }, [swatches]);

  const handleClick = useCallback(
    (title) => dispatch('setSelectedSwatchGroup', title),
    [dispatch],
  );

  const groupElements = useMemo(
    () =>
      flatSwatchGroup.map((group) => (
        <ListView.Row
          id={group.name}
          key={group.name}
          onClick={() => handleClick(group.path)}
          selected={selectedGroup === group.path}
        >
          <Spacer.Horizontal size={16 * group.depth} />
          <GroupIcon />
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
          onClick={() => handleClick('')}
          selected={selectedGroup === ''}
        >
          <Header>{'All Color Variables'}</Header>
        </ListView.Row>
        {groupElements}
      </ListView.Root>
    </Container>
  );
});
