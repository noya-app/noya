import { Spacer } from 'noya-designsystem';
import { PlusIcon } from '@radix-ui/react-icons';
import { useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import Button from 'noya-designsystem/src/components/Button';
import { useApplicationState } from '../contexts/ApplicationStateContext';

const Container = styled.header(({ theme }) => ({
  height: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.dividerStrong}`,
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
}));

export default function Toolbar() {
  const [, dispatch] = useApplicationState();
  const itemSeparatorSize = useTheme().sizes.toolbar.itemSeparator;

  return useMemo(
    () => (
      <Container>
        <Spacer.Horizontal size={8} />
        <Button
          id="tool-swatch"
          tooltip="Insert an Swatch"
          onClick={() => dispatch('addColorSwatch')}
        >
          <PlusIcon />
        </Button>
        <Spacer.Horizontal size={itemSeparatorSize} />
        <Spacer.Horizontal size={8} />
      </Container>
    ),
    [dispatch, itemSeparatorSize],
  );
}
