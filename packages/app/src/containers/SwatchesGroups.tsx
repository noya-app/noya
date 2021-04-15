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
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
}));

const Header = styled.div(({ theme }) => ({
  fontWeight: 600,
}));

export default memo(function SwatchesGroups() {
  const [state, dispatch] = useApplicationState();

  const swatches = useShallowArray(useSelector(Selectors.getSharedSwatches));

  const selectedGroup = state.selectedGroupSwatch;

  //This could be a selector
  const swatchesTitles = useMemo(() => {
    const titles: { value: string; full: string; depth: number }[] = [];

    swatches.forEach((swatch) => {
      const name = swatch.name.split('/').slice(0, -1);

      const full = name.join('/');
      const value = name.pop() || '';
      const depth = name.length;

      if (titles.some((t) => t.full === full) || value === '') return;
      titles.push({ value, full, depth });
    });
    return titles;
  }, [swatches]);

  const handleClick = useCallback(
    (title: string = '') => dispatch('setSelectedSwatchGroup', title),
    [dispatch],
  );

  const groupElements = useMemo(() => {
    return swatchesTitles.map((title) => (
      <ListView.Row
        id={title.value}
        key={title.value}
        onClick={() => handleClick(title.full)}
        selected={selectedGroup === title.full}
      >
        <Spacer.Horizontal size={(6 + 12) * title.depth} />
        {title.depth === 1 ? <GroupIcon /> : <MaskOnIcon />}
        <Spacer.Horizontal size={8} />
        {title.value}
      </ListView.Row>
    ));
  }, [swatchesTitles, selectedGroup, handleClick]);

  return (
    <Container>
      <ListView.Root>
        <ListView.Row
          id={'a'}
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
