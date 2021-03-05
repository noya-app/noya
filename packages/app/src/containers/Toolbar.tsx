import { Spacer } from 'noya-designsystem';
import {
  BoxModelIcon,
  CircleIcon,
  MoveIcon,
  SquareIcon,
  TextIcon,
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
        <Spacer.Horizontal size={8} />
        <Button
          id="tool-artboard"
          tooltip="Insert an artboard"
          active={interactionType === 'insertArtboard'}
          onClick={() => {
            if (interactionType === 'insertArtboard') {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insertArtboard']);
            }
          }}
        >
          <BoxModelIcon />
        </Button>
        <Spacer.Horizontal size={itemSeparatorSize} />
        <Button
          id="tool-rectangle"
          tooltip="Insert a rectangle"
          active={interactionType === 'insertRectangle'}
          onClick={() => {
            if (interactionType === 'insertRectangle') {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insertRectangle']);
            }
          }}
        >
          <SquareIcon />
        </Button>
        <Spacer.Horizontal size={itemSeparatorSize} />
        <Button
          id="tool-oval"
          tooltip="Insert an oval"
          active={interactionType === 'insertOval'}
          onClick={() => {
            if (interactionType === 'insertOval') {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insertOval']);
            }
          }}
        >
          <CircleIcon />
        </Button>
        <Spacer.Horizontal size={itemSeparatorSize} />
        <Button
          id="tool-text"
          tooltip="Insert text"
          active={interactionType === 'insertText'}
          onClick={() => {
            if (interactionType === 'insertText') {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insertText']);
            }
          }}
        >
          <TextIcon />
        </Button>
        <Spacer.Horizontal size={itemSeparatorSize} />
        <Button
          id="tool-move"
          tooltip="Move the canvas"
          active={
            interactionType === 'panMode' ||
            interactionType === 'maybePan' ||
            interactionType === 'panning'
          }
          onClick={() => {
            if (interactionType === 'panMode') {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['enablePanMode']);
            }
          }}
        >
          <MoveIcon />
        </Button>
        <Spacer.Horizontal size={8} />
      </Container>
    ),
    [dispatch, interactionType, itemSeparatorSize],
  );
}
