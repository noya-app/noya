import {
  ChevronDownIcon,
  CircleIcon,
  FrameIcon,
  MoveIcon,
  RulerHorizontalIcon,
  SewingPinIcon,
  SquareIcon,
  TextIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  createSectionedMenu,
  DropdownMenu,
  MenuItem,
  RegularMenuItem,
  Spacer,
} from 'noya-designsystem';
import { useKeyboardShortcuts } from 'noya-keymap';
import { InteractionType, Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import PointModeIcon from '../components/icons/PointModeIcon';
import {
  useApplicationState,
  useDispatch,
  useSelector,
} from 'noya-app-state-context';
import { useHistory } from '../hooks/useHistory';
import useShallowArray from '../hooks/useShallowArray';
import { useWorkspace } from 'noya-app-state-context';

const Container = styled.header(({ theme }) => ({
  minHeight: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.dividerStrong}`,
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
}));

const Row = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minWidth: '50px',
}));

interface Props {
  interactionType: InteractionType;
  setShowRulers: (value: boolean) => void;
  showRulers: boolean;
  redoDisabled: boolean;
  undoDisabled: boolean;
  selectedLayerIds: string[];
}

type InsertMenuShape = 'rectangle' | 'oval' | 'vector' | 'text';

const SYMBOL_ITEM_PREFIX = 'symbol:';

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

  const symbolsMenuItems = useSelector(Selectors.getSymbols).map((symbol) => ({
    title: symbol.name,
    value: `${SYMBOL_ITEM_PREFIX}${symbol.do_objectID}`,
  }));

  const shapeMenuItems: RegularMenuItem<InsertMenuShape>[] = [
    { title: 'Rectangle', value: 'rectangle' },
    { title: 'Oval', value: 'oval' },
    { title: 'Vector', value: 'vector' },
    { title: 'Text', value: 'text' },
  ];

  const menuItems: MenuItem<string>[] = createSectionedMenu(
    shapeMenuItems,
    symbolsMenuItems,
  );

  const isInsertArtboard = interactionType === 'insertArtboard';
  const isInsertRectangle = interactionType === 'insertRectangle';
  const isInsertOval = interactionType === 'insertOval';
  const isInsertText = interactionType === 'insertText';
  const isEditingPath = Selectors.getIsEditingPath(interactionType);
  const isCreatingPath = interactionType === 'drawingShapePath';

  const isPanning =
    interactionType === 'panMode' ||
    interactionType === 'maybePan' ||
    interactionType === 'panning';

  const handleInsertArtboard = useCallback(() => {
    if (isInsertArtboard) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insertArtboard']);
    }
  }, [dispatch, isInsertArtboard]);

  const handleInsertRectangle = useCallback(() => {
    if (isInsertRectangle) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insertRectangle']);
    }
  }, [isInsertRectangle, dispatch]);

  const handleInsertOval = useCallback(() => {
    if (isInsertOval) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insertOval']);
    }
  }, [isInsertOval, dispatch]);

  const handleInsertText = useCallback(() => {
    if (isInsertText) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insertText']);
    }
  }, [isInsertText, dispatch]);

  const handleEnablePanMode = useCallback(() => {
    if (isPanning) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['enablePanMode']);
    }
  }, [isPanning, dispatch]);

  const handleEnablePenTool = useCallback(() => {
    if (isCreatingPath) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['drawingShapePath']);
    }
  }, [isCreatingPath, dispatch]);

  const handleInsertSymbol = useCallback(
    (value: string) => {
      if (value.startsWith(SYMBOL_ITEM_PREFIX)) {
        const id = value.replace(SYMBOL_ITEM_PREFIX, '');
        dispatch('interaction', ['insertingSymbol', id, undefined]);
      } else {
        switch (value as InsertMenuShape) {
          case 'rectangle':
            dispatch('interaction', ['insertRectangle']);
            break;
          case 'oval':
            dispatch('interaction', ['insertOval']);
            break;
          case 'text':
            dispatch('interaction', ['insertText']);
            break;
          case 'vector':
            dispatch('interaction', ['drawingShapePath']);
            break;
        }
      }
    },
    [dispatch],
  );
  const handleUndo = useCallback(() => dispatch('undo'), [dispatch]);

  const handleRedo = useCallback(() => dispatch('redo'), [dispatch]);

  useKeyboardShortcuts({
    a: handleInsertArtboard,
    r: handleInsertRectangle,
    o: handleInsertOval,
    t: handleInsertText,
    p: handleEnablePenTool,
    v: handleEnablePenTool,
    'Mod-z': handleUndo,
    'Mod-Shift-z': handleRedo,
  });

  useKeyboardShortcuts('keydown', {
    Space: () => {
      if (interactionType !== 'none') return;

      dispatch('interaction', ['enablePanMode']);
    },
  });

  useKeyboardShortcuts('keyup', {
    Space: () => {
      if (!isPanning) return;

      dispatch('interaction', ['reset']);
    },
  });

  return (
    <Container>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Row>
        <DropdownMenu<string> items={menuItems} onSelect={handleInsertSymbol}>
          <Button id="insert-stymbol">
            {useMemo(
              () => (
                <>
                  Insert
                  <Spacer.Horizontal size={8} />
                  <ChevronDownIcon />
                </>
              ),
              [],
            )}
          </Button>
        </DropdownMenu>
      </Row>
      <Spacer.Horizontal size={8} />
      <Button
        id="tool-artboard"
        tooltip="Insert an artboard"
        active={isInsertArtboard}
        onClick={handleInsertArtboard}
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
        onClick={handleInsertRectangle}
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
        onClick={handleInsertOval}
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
        onClick={handleInsertText}
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
        onClick={handleEnablePanMode}
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
        id="create-path"
        tooltip="Create path"
        active={isCreatingPath}
        onClick={handleEnablePenTool}
      >
        {useMemo(
          () => (
            <SewingPinIcon />
          ),
          [],
        )}
      </Button>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="edit-path"
        tooltip="Edit path"
        active={isEditingPath}
        disabled={selectedLayerIds.length === 0}
        onClick={useCallback(() => {
          if (!isEditingPath) {
            dispatch('interaction', ['editPath']);
          } else {
            dispatch('interaction', ['reset']);
          }
        }, [isEditingPath, dispatch])}
      >
        {useMemo(
          () => (
            <PointModeIcon />
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
      <Button id="undo" disabled={undoDisabled} onClick={handleUndo}>
        Undo
      </Button>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button id="redo" disabled={redoDisabled} onClick={handleRedo}>
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
