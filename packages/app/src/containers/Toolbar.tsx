import styled from 'styled-components';
import Button from '../components/Button';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import {
  SquareIcon,
  CircleIcon,
  TextIcon,
  BoxModelIcon,
  MoveIcon,
} from '@radix-ui/react-icons';
import * as Spacer from '../components/Spacer';
import { useMemo } from 'react';
import { Selectors } from 'noya-state';

const Container = styled.header<{ showLabels: boolean }>(
  ({ theme, showLabels }) => ({
    height: `${
      showLabels
        ? theme.sizes.toolbarHeight.large
        : theme.sizes.toolbarHeight.small
    }px`,
    display: 'flex',
    borderBottom: `1px solid ${theme.colors.dividerStrong}`,
    alignItems: 'center',
    backgroundColor: theme.colors.sidebar.background,
    color: theme.colors.textMuted,
  }),
);

export default function Toolbar() {
  const [state, dispatch] = useApplicationState();
  const showLabels = Selectors.getShowToolbarLabels(state);
  const itemSeparatorSize = showLabels ? 16 : 8;
  const interactionType = state.interactionState.type;

  return useMemo(
    () => (
      <Container showLabels={showLabels}>
        <Spacer.Horizontal size={8} />
        <Button
          id="tool-artboard"
          active={interactionType === 'insertArtboard'}
          label={showLabels ? 'Artboard' : undefined}
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
          active={interactionType === 'insertRectangle'}
          label={showLabels ? 'Rectangle' : undefined}
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
          active={interactionType === 'insertOval'}
          label={showLabels ? 'Oval' : undefined}
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
          active={interactionType === 'insertText'}
          label={showLabels ? 'Text' : undefined}
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
          active={
            interactionType === 'panMode' ||
            interactionType === 'maybePan' ||
            interactionType === 'panning'
          }
          label={showLabels ? 'Pan' : undefined}
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
    [dispatch, interactionType, itemSeparatorSize, showLabels],
  );
}
