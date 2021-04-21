import { GroupIcon } from '@radix-ui/react-icons';
import { ListView, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { sortBy } from 'noya-utils';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import { createThemeGroups } from '../utils/themeTree';

const Container = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const Header = styled.div(({ theme }) => ({
  fontWeight: 500,
}));

export default memo(function SwatchesGroups() {
  const [state, dispatch] = useApplicationState();

  const sharedStyles = useShallowArray(useSelector(Selectors.getSharedStyles));
  const selectedGroup = state.selectedThemeStyleGroup;

  const groups = useMemo(() => {
    const groups = createThemeGroups(sharedStyles);
    groups.shift();

    return sortBy(groups, 'path');
  }, [sharedStyles]);

  const handleClick = useCallback(
    (title) => dispatch('setSelectedThemeStyleGroup', title),
    [dispatch],
  );

  const groupElements = useMemo(
    () =>
      groups.map((group) => (
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
    [groups, selectedGroup, handleClick],
  );

  return (
    <Container>
      <ListView.Root>
        <ListView.Row
          onClick={() => handleClick('')}
          selected={selectedGroup === ''}
        >
          <Header>All Theme Styles</Header>
        </ListView.Row>
        {groupElements}
      </ListView.Root>
    </Container>
  );
});
