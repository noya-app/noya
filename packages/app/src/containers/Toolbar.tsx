import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
  useApplicationState,
  useDispatch,
  useSelector,
} from 'noya-app-state-context';
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
import useShallowArray from '../hooks/useShallowArray';

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
  selectedLayerIds: string[];
}

type InsertMenuShape = 'artboard' | 'rectangle' | 'oval' | 'vector' | 'text';

const SYMBOL_ITEM_PREFIX = 'symbol:';

const ToolbarContent = memo(function ToolbarContent({
  interactionType,
  selectedLayerIds,
}: Props) {
  const dispatch = useDispatch();
  const itemSeparatorSize = useTheme().sizes.toolbar.itemSeparator;

  const symbolsMenuItems = useSelector(Selectors.getSymbols).map((symbol) => ({
    title: symbol.name,
    value: `${SYMBOL_ITEM_PREFIX}${symbol.do_objectID}`,
  }));

  const shapeMenuItems: RegularMenuItem<InsertMenuShape>[] = [
    { title: 'Artboard', value: 'artboard' },
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
          case 'artboard':
            dispatch('interaction', ['insertArtboard']);
            break;
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
    </Container>
  );
});

export default function Toolbar() {
  const [state] = useApplicationState();
  const selectedLayerIds = useShallowArray(state.selectedObjects);

  return (
    <ToolbarContent
      interactionType={state.interactionState.type}
      selectedLayerIds={selectedLayerIds}
    />
  );
}
