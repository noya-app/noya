import { Spacer } from 'noya-designsystem';
import {
  PlusIcon,
} from '@radix-ui/react-icons';
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
  const [state, dispatch] = useApplicationState();
  const itemSeparatorSize = useTheme().sizes.toolbar.itemSeparator;
  const interactionType = state.interactionState.type;

  return useMemo(
    () => (
      <Container>
        <div>
            <p>Untitle <br/> Edited</p>
        </div>
        <Spacer.Horizontal size={50} />
        <Button
          id="tool-artboard"
          tooltip="Insert an artboard"
          active={interactionType === 'addColor'}
          onClick={() => {
            dispatch('addColorSwatch');
          }}
        >
          <PlusIcon />
        </Button>
        <Spacer.Horizontal size={itemSeparatorSize} />
        <Spacer.Horizontal size={8} />
      </Container>
    ),
    [dispatch, interactionType, itemSeparatorSize],
  );
}
