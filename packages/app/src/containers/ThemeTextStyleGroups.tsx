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

export default memo(function TextGroups() {
  const [state, dispatch] = useApplicationState();

  const textStyles = useShallowArray(
    useSelector(Selectors.getSharedTextStyles),
  );
  const selectedGroup = state.selectedTextStyleGroup;

  const groups = useMemo(() => {
    const groups = createThemeGroups(textStyles);
    groups.shift();

    return sortBy(groups, 'path');
  }, [textStyles]);

  const handleClick = useCallback(
    (title?) => dispatch('setSelectedTextStyleGroup', title || ''),
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
        <ListView.Row onClick={handleClick} selected={selectedGroup === ''}>
          <Header>All Text Styles</Header>
        </ListView.Row>
        {groupElements}
      </ListView.Root>
    </Container>
  );
});
