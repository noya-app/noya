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
import {
  DrawableLayerType,
  InteractionType,
  Layers,
  Selectors,
} from 'noya-state';
import { round } from 'noya-utils';
import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import PointModeIcon from '../components/icons/PointModeIcon';
import { LayerIcon } from './LayerList';

type InteractionStateProjection =
  | {
      type: 'insert';
      layerType: DrawableLayerType;
    }
  | { type: Exclude<InteractionType, 'insert'> };

type InsertMenuLayerType =
  | 'artboard'
  | 'rectangle'
  | 'oval'
  | 'line'
  | 'vector'
  | 'text'
  | 'slice';

type ZoomMenuType =
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomActualSize'
  | 'zoomToFitCanvas'
  | 'zoomToFitSelection';

const SYMBOL_ITEM_PREFIX = 'symbol:';

interface Props {
  interactionStateProjection: InteractionStateProjection;
  canStartEditingPath: boolean;
  zoomValue: number;
  hasSelectedLayer: boolean;
}

const ToolbarContent = memo(function ToolbarContent({
  interactionStateProjection,
  canStartEditingPath,
  zoomValue,
  hasSelectedLayer,
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

  const insertMenuItems: MenuItem<string>[] = createSectionedMenu(
    shapeMenuItems,
    symbolsMenuItems,
  );

  const zoomMenuItems: MenuItem<ZoomMenuType>[] = createSectionedMenu(
    [
      {
        title: 'Zoom In',
        value: 'zoomIn',
      },
      {
        title: 'Zoom Out',
        value: 'zoomOut',
      },
    ],
    [
      {
        title: 'Actual Size',
        value: 'zoomActualSize',
      },
      {
        title: 'Fit Canvas',
        value: 'zoomToFitCanvas',
      },
      {
        title: 'Fit Selection',
        value: 'zoomToFitSelection',
        disabled: !hasSelectedLayer,
      },
    ],
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

  const handleZoomMenuItem = useCallback(
    (type: ZoomMenuType) => {
      switch (type) {
        case 'zoomIn':
          dispatch('setZoom', 2, 'multiply');
          break;
        case 'zoomOut':
          dispatch('setZoom', 0.5, 'multiply');
          break;
        case 'zoomActualSize':
          dispatch('setZoom', 1);
          break;
        case 'zoomToFitCanvas':
          dispatch('zoomToFit', 'canvas');
          break;
        case 'zoomToFitSelection':
          dispatch('zoomToFit', 'selection');
          break;
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
      <DropdownMenu<string>
        items={insertMenuItems}
        onSelect={handleInsertSymbol}
      >
        <Button id="insert-symbol">
          {useMemo(
            () => (
              <>
                Insert
                <Spacer.Horizontal size={12} />
                <ChevronDownIcon />
              </>
            ),
            [],
          )}
        </Button>
      </DropdownMenu>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <DropdownMenu<ZoomMenuType>
        items={zoomMenuItems}
        onSelect={handleZoomMenuItem}
      >
        <Button id="zoom-dropdown" flex="0 0 80px">
          {useMemo(
            () => (
              <>
                {round(zoomValue * 100).toString()}%
                <Spacer.Horizontal />
                <ChevronDownIcon />
              </>
            ),
            [zoomValue],
          )}
        </Button>
      </DropdownMenu>
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="edit-path"
        tooltip="Edit path"
        active={isEditingPath}
        disabled={!(isEditingPath || canStartEditingPath)}
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
  const { zoomValue } = Selectors.getCurrentPageMetadata(state);
  const hasSelectedLayer = state.selectedLayerIds.length > 0;

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

  const canStartEditingPath =
    state.interactionState.type === 'none' &&
    Selectors.getSelectedLayers(state).filter(Layers.isPointsLayer).length > 0;

  return (
    <ToolbarContent
      interactionStateProjection={projection}
      canStartEditingPath={canStartEditingPath}
      zoomValue={zoomValue}
      hasSelectedLayer={hasSelectedLayer}
    />
  );
}
