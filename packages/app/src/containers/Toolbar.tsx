import styled from 'styled-components';
import Button from '../components/Button';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import {
  SquareIcon,
  CircleIcon,
  TextIcon,
  BoxModelIcon,
} from '@radix-ui/react-icons';
import * as Spacer from '../components/Spacer';
import { useMemo } from 'react';

const Container = styled.header(({ theme }) => ({
  height: '60px',
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.dividerStrong}`,
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
}));

export default function Toolbar() {
  const [state, dispatch] = useApplicationState();
  const interactionType = state.interactionState.type;

  return useMemo(
    () => (
      <Container>
        <Spacer.Horizontal size={8} />
        <Button
          id="tool-artboard"
          active={interactionType === 'insertArtboard'}
          label="Artboard"
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
        <Spacer.Horizontal size={16} />
        <Button
          id="tool-rectangle"
          active={interactionType === 'insertRectangle'}
          label="Rectangle"
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
        <Spacer.Horizontal size={16} />
        <Button
          id="tool-oval"
          active={interactionType === 'insertOval'}
          label="Oval"
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
        <Spacer.Horizontal size={16} />
        <Button
          id="tool-text"
          active={interactionType === 'insertText'}
          label="Text"
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
        <Spacer.Horizontal size={8} />
      </Container>
    ),
    [dispatch, interactionType],
  );
}
