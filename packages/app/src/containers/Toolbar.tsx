import {
  CircleIcon,
  FrameIcon,
  MoveIcon,
  RadiobuttonIcon,
  RulerHorizontalIcon,
  SquareIcon,
  TextIcon,
} from '@radix-ui/react-icons';
import { Spacer } from 'noya-designsystem';
import Button from 'noya-designsystem/src/components/Button';
import { InteractionType } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import {
  useApplicationState,
  useDispatch,
} from '../contexts/ApplicationStateContext';
import { useHistory } from '../hooks/useHistory';
import useShallowArray from '../hooks/useShallowArray';
import { useWorkspace } from '../hooks/useWorkspace';

const Container = styled.header(({ theme }) => ({
  minHeight: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.dividerStrong}`,
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
}));

interface Props {
  interactionType: InteractionType;
  setShowRulers: (value: boolean) => void;
  showRulers: boolean;
  redoDisabled: boolean;
  undoDisabled: boolean;
  selectedLayerIds: string[];
}

const ToolbarContent = memo(function ToolbarContent({
  interactionType,
  setShowRulers,
  showRulers,
  redoDisabled,
  undoDisabled,
  selectedLayerIds,
}: Props) {
  const dispatch = useDispatch();
  const itemSeparatorSize = useTheme().sizes.toolbar.itemSeparator;

  const isInsertArtboard = interactionType === 'insertArtboard';
  const isInsertRectangle = interactionType === 'insertRectangle';
  const isInsertOval = interactionType === 'insertOval';
  const isInsertText = interactionType === 'insertText';
  const isEditingPath = interactionType === 'editPath';
  const isPanning =
    interactionType === 'panMode' ||
    interactionType === 'maybePan' ||
    interactionType === 'panning';

  return (
    <Container>
      <Spacer.Horizontal size={8} />
      <Button
        id="tool-artboard"
        tooltip="Insert an artboard"
        active={isInsertArtboard}
        onClick={useCallback(() => {
          if (isInsertArtboard) {
            dispatch('interaction', ['reset']);
          } else {
            dispatch('interaction', ['insertArtboard']);
          }
        }, [dispatch, isInsertArtboard])}
      >
        {useMemo(
          () => (
            <FrameIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="tool-rectangle"
        tooltip="Insert a rectangle"
        active={isInsertRectangle}
        onClick={useCallback(() => {
          if (isInsertRectangle) {
            dispatch('interaction', ['reset']);
          } else {
            dispatch('interaction', ['insertRectangle']);
          }
        }, [isInsertRectangle, dispatch])}
      >
        {useMemo(
          () => (
            <SquareIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="tool-oval"
        tooltip="Insert an oval"
        active={isInsertOval}
        onClick={useCallback(() => {
          if (isInsertOval) {
            dispatch('interaction', ['reset']);
          } else {
            dispatch('interaction', ['insertOval']);
          }
        }, [isInsertOval, dispatch])}
      >
        {useMemo(
          () => (
            <CircleIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="tool-text"
        tooltip="Insert text"
        active={isInsertText}
        onClick={useCallback(() => {
          if (isInsertText) {
            dispatch('interaction', ['reset']);
          } else {
            dispatch('interaction', ['insertText']);
          }
        }, [isInsertText, dispatch])}
      >
        {useMemo(
          () => (
            <TextIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="tool-move"
        tooltip="Move the canvas"
        active={isPanning}
        onClick={useCallback(() => {
          if (isPanning) {
            dispatch('interaction', ['reset']);
          } else {
            dispatch('interaction', ['enablePanMode']);
          }
        }, [isPanning, dispatch])}
      >
        {useMemo(
          () => (
            <MoveIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={40} />
      <Button
        id="edit-path"
        tooltip="Edit path"
        active={isEditingPath}
        onClick={useCallback(() => {
          if (!isEditingPath) {
            dispatch('interaction', ['editPath', selectedLayerIds]);
          } else {
            dispatch('interaction', ['reset']);
          }
        }, [isEditingPath, dispatch, selectedLayerIds])}
      >
        {useMemo(
          () => (
            <RadiobuttonIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={40} />
      <Button
        id="tool-rulers"
        tooltip="Show rulers"
        active={showRulers}
        onClick={useCallback(() => {
          setShowRulers(!showRulers);
        }, [setShowRulers, showRulers])}
      >
        {useMemo(
          () => (
            <RulerHorizontalIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={40} />
      <Button
        id="undo"
        disabled={undoDisabled}
        onClick={useCallback(() => dispatch('undo'), [dispatch])}
      >
        Undo
      </Button>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="redo"
        disabled={redoDisabled}
        onClick={useCallback(() => dispatch('redo'), [dispatch])}
      >
        Redo
      </Button>
      <Spacer.Horizontal size={8} />
    </Container>
  );
});

export default function Toolbar() {
  const [state] = useApplicationState();
  const {
    setShowRulers,
    preferences: { showRulers },
  } = useWorkspace();
  const { redoDisabled, undoDisabled } = useHistory();
  const selectedLayerIds = useShallowArray(state.selectedObjects);

  return (
    <ToolbarContent
      interactionType={state.interactionState.type}
      setShowRulers={setShowRulers}
      showRulers={showRulers}
      redoDisabled={redoDisabled}
      undoDisabled={undoDisabled}
      selectedLayerIds={selectedLayerIds}
    />
  );
}
