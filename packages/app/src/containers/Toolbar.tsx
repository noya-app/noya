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
import { FALLTHROUGH, KeyCommand, useKeyboardShortcuts } from 'noya-keymap';
import { DrawableLayerType, InteractionType, Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import PointModeIcon from '../components/icons/PointModeIcon';
import { useShallowArray } from 'noya-react-utils';
import { LayerIcon } from './LayerList';

const Row = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minWidth: '50px',
}));

type InteractionStateProjection =
  | {
      type: 'insert';
      layerType: DrawableLayerType;
    }
  | { type: Exclude<InteractionType, 'insert'> };

interface Props {
  interactionStateProjection: InteractionStateProjection;
  selectedLayerIds: string[];
}

type InsertMenuLayerType =
  | 'artboard'
  | 'rectangle'
  | 'oval'
  | 'line'
  | 'vector'
  | 'text'
  | 'slice';

const SYMBOL_ITEM_PREFIX = 'symbol:';

const ToolbarContent = memo(function ToolbarContent({
  interactionStateProjection,
  selectedLayerIds,
}: Props) {
  const dispatch = useDispatch();
  const itemSeparatorSize = useTheme().sizes.toolbar.itemSeparator;

  const symbolsMenuItems = useSelector(Selectors.getSymbols).map((symbol) => ({
    title: symbol.name,
    value: `${SYMBOL_ITEM_PREFIX}${symbol.do_objectID}`,
  }));

  const shapeMenuItems: RegularMenuItem<InsertMenuLayerType>[] = [
    {
      title: 'Artboard',
      value: 'artboard',
      icon: <LayerIcon type="artboard" />,
    },
    {
      title: 'Rectangle',
      value: 'rectangle',
      icon: <LayerIcon type="rectangle" />,
    },
    { title: 'Oval', value: 'oval', icon: <LayerIcon type="oval" /> },
    { title: 'Line', value: 'line', icon: <LayerIcon type="shapePath" /> },
    { title: 'Vector', value: 'vector', icon: <LayerIcon type="shapePath" /> },
    { title: 'Text', value: 'text', icon: <LayerIcon type="text" /> },
    { title: 'Slice', value: 'slice', icon: <LayerIcon type="slice" /> },
  ];

  const menuItems: MenuItem<string>[] = createSectionedMenu(
    shapeMenuItems,
    symbolsMenuItems,
  );

  const interactionType = interactionStateProjection.type;
  const isInsertingLayerType =
    interactionStateProjection.type === 'insert'
      ? interactionStateProjection.layerType
      : undefined;

  const isInsertArtboard = isInsertingLayerType === 'artboard';
  const isInsertRectangle = isInsertingLayerType === 'rectangle';
  const isInsertOval = isInsertingLayerType === 'oval';
  const isInsertLine = isInsertingLayerType === 'line';
  const isInsertText = isInsertingLayerType === 'text';
  const isInsertSlice = isInsertingLayerType === 'slice';
  const isEditingPath = Selectors.getIsEditingPath(interactionType);
  const isEditingText = Selectors.getIsEditingText(interactionType);
  const isCreatingPath = interactionType === 'drawingShapePath';

  const handleInsertArtboard: KeyCommand = useCallback(() => {
    if (isEditingText) return FALLTHROUGH;

    if (isInsertArtboard) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'artboard']);
    }
  }, [dispatch, isEditingText, isInsertArtboard]);

  const handleInsertRectangle: KeyCommand = useCallback(() => {
    if (isEditingText) return FALLTHROUGH;

    if (isInsertRectangle) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'rectangle']);
    }
  }, [isEditingText, isInsertRectangle, dispatch]);

  const handleInsertOval = useCallback(() => {
    if (isEditingText) return FALLTHROUGH;

    if (isInsertOval) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'oval']);
    }
  }, [isEditingText, isInsertOval, dispatch]);

  const handleInsertLine = useCallback(() => {
    if (isEditingText) return FALLTHROUGH;

    if (isInsertLine) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'line']);
    }
  }, [isEditingText, isInsertLine, dispatch]);

  const handleInsertText = useCallback(() => {
    if (isEditingText) return FALLTHROUGH;

    if (isInsertText) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'text']);
    }
  }, [isEditingText, isInsertText, dispatch]);

  const handleInsertSlice = useCallback(() => {
    if (isEditingText) return FALLTHROUGH;

    if (isInsertSlice) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'slice']);
    }
  }, [isEditingText, isInsertSlice, dispatch]);

  const handleEnablePenTool = useCallback(() => {
    if (isEditingText) return FALLTHROUGH;

    if (isCreatingPath) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['drawingShapePath']);
    }
  }, [isEditingText, isCreatingPath, dispatch]);

  const handleInsertSymbol = useCallback(
    (value: string) => {
      if (value.startsWith(SYMBOL_ITEM_PREFIX)) {
        const id = value.replace(SYMBOL_ITEM_PREFIX, '');
        dispatch('interaction', ['insertingSymbol', id, undefined]);
      } else {
        switch (value as InsertMenuLayerType) {
          case 'artboard':
            dispatch('interaction', ['insert', 'artboard']);
            break;
          case 'rectangle':
            dispatch('interaction', ['insert', 'rectangle']);
            break;
          case 'oval':
            dispatch('interaction', ['insert', 'oval']);
            break;
          case 'line':
            dispatch('interaction', ['insert', 'line']);
            break;
          case 'text':
            dispatch('interaction', ['insert', 'text']);
            break;
          case 'slice':
            dispatch('interaction', ['insert', 'slice']);
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
    f: handleInsertArtboard,
    r: handleInsertRectangle,
    o: handleInsertOval,
    l: handleInsertLine,
    t: handleInsertText,
    s: handleInsertSlice,
    p: handleEnablePenTool,
    v: handleEnablePenTool,
    'Mod-z': handleUndo,
    'Mod-Shift-z': handleRedo,
  });

  return (
    <>
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
    </>
  );
});

export default function Toolbar() {
  const [state] = useApplicationState();
  const selectedLayerIds = useShallowArray(state.selectedObjects);

  const layerType =
    state.interactionState.type === 'insert'
      ? state.interactionState.layerType
      : undefined;

  const projection = useMemo(
    (): InteractionStateProjection =>
      state.interactionState.type === 'insert'
        ? { type: 'insert', layerType: layerType! }
        : { type: state.interactionState.type },
    [state.interactionState.type, layerType],
  );

  return (
    <ToolbarContent
      interactionStateProjection={projection}
      selectedLayerIds={selectedLayerIds}
    />
  );
}
