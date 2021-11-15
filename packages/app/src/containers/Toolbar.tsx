import { FileSystemHandle } from 'browser-fs-access';
import {
  useApplicationState,
  useDispatch,
  useSelector,
  useWorkspaceState,
} from 'noya-app-state-context';
import {
  Button,
  createSectionedMenu,
  DropdownMenu,
  MenuItem,
  RegularMenuItem,
  Spacer,
  Tooltip,
} from 'noya-designsystem';
import { ChevronDownIcon, PointModeIcon } from 'noya-icons';
import { KeyCommand, useKeyboardShortcuts } from 'noya-keymap';
import {
  DrawableLayerType,
  InteractionType,
  Layers,
  Selectors,
} from 'noya-state';
import { getComponentInfo } from 'noya-typescript';
import { round } from 'noya-utils';
import { memo, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTypescriptCompiler } from '../contexts/TypescriptCompilerContext';
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
  | 'slice'
  | 'componentContainer';

type ZoomMenuType =
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomActualSize'
  | 'zoomToFitCanvas'
  | 'zoomToFitSelection';

const SYMBOL_ITEM_PREFIX = 'symbol:';

const DocumentTitle = styled.span(({ theme }) => ({
  ...theme.textStyles.small,
  fontWeight: 600,
  flex: '0 0 200px',
  maxWidth: '200px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre',
  userSelect: 'none',
}));

interface Props {
  interactionStateProjection: InteractionStateProjection;
  canStartEditingPath: boolean;
  zoomValue: number;
  hasSelectedLayer: boolean;
  fileHandle?: FileSystemHandle;
}

const ToolbarContent = memo(function ToolbarContent({
  interactionStateProjection,
  canStartEditingPath,
  zoomValue,
  hasSelectedLayer,
  fileHandle,
}: Props) {
  const dispatch = useDispatch();

  const itemSeparatorSize = useTheme().sizes.toolbar.itemSeparator;

  const interactionType = interactionStateProjection.type;
  const isInsertingLayerType =
    interactionStateProjection.type === 'insert'
      ? interactionStateProjection.layerType
      : undefined;

  const isInsertComponentContainer =
    isInsertingLayerType === 'componentContainer';
  const isInsertArtboard = isInsertingLayerType === 'artboard';
  const isInsertRectangle = isInsertingLayerType === 'rectangle';
  const isInsertOval = isInsertingLayerType === 'oval';
  const isInsertLine = isInsertingLayerType === 'line';
  const isInsertText = isInsertingLayerType === 'text';
  const isInsertSlice = isInsertingLayerType === 'slice';
  const isEditingPath = Selectors.getIsEditingPath(interactionType);
  const isEditingText = Selectors.getIsEditingText(interactionType);
  const isCreatingPath = interactionType === 'drawingShapePath';

  const symbolsMenuItems = useSelector(Selectors.getSymbols).map((symbol) => ({
    title: symbol.name,
    value: `${SYMBOL_ITEM_PREFIX}${symbol.do_objectID}`,
  }));

  const shapeMenuItems: RegularMenuItem<InsertMenuLayerType>[] = [
    {
      title: 'Component',
      value: 'componentContainer',
      shortcut: 'c',
      disabled: isEditingText,
      icon: <LayerIcon type="componentContainer" />,
    },
    {
      title: 'Artboard',
      value: 'artboard',
      shortcut: 'a',
      disabled: isEditingText,
      icon: <LayerIcon type="artboard" />,
    },
    {
      title: 'Rectangle',
      value: 'rectangle',
      shortcut: 'r',
      disabled: isEditingText,
      icon: <LayerIcon type="rectangle" />,
    },
    {
      title: 'Oval',
      value: 'oval',
      shortcut: 'o',
      disabled: isEditingText,
      icon: <LayerIcon type="oval" />,
    },
    {
      title: 'Line',
      value: 'line',
      shortcut: 'l',
      disabled: isEditingText,
      icon: <LayerIcon type="line" />,
    },
    {
      title: 'Vector',
      value: 'vector',
      shortcut: 'v',
      disabled: isEditingText,
      icon: <LayerIcon type="shapePath" />,
    },
    {
      title: 'Text',
      value: 'text',
      shortcut: 't',
      disabled: isEditingText,
      icon: <LayerIcon type="text" />,
    },
    {
      title: 'Slice',
      value: 'slice',
      shortcut: 's',
      disabled: isEditingText,
      icon: <LayerIcon type="slice" />,
    },
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
        shortcut: 'Mod-+',
      },
      {
        title: 'Zoom Out',
        value: 'zoomOut',
        shortcut: 'Mod--',
      },
    ],
    [
      {
        title: 'Actual Size',
        value: 'zoomActualSize',
        shortcut: 'Mod-0',
      },
      {
        title: 'Fit Canvas',
        value: 'zoomToFitCanvas',
        shortcut: 'Mod-1',
      },
      {
        title: 'Fit Selection',
        value: 'zoomToFitSelection',
        disabled: !hasSelectedLayer,
        shortcut: 'Mod-2',
      },
    ],
  );

  const handleInsertSymbol = useCallback(
    (value: string) => {
      if (value.startsWith(SYMBOL_ITEM_PREFIX)) {
        const id = value.replace(SYMBOL_ITEM_PREFIX, '');
        dispatch('interaction', ['insertingSymbol', id, undefined]);
      } else {
        switch (value as InsertMenuLayerType) {
          case 'artboard':
            if (isInsertArtboard) {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insert', 'artboard']);
            }
            break;
          case 'componentContainer':
            if (isInsertComponentContainer) {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insert', 'componentContainer']);
            }
            break;
          case 'rectangle':
            if (isInsertRectangle) {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insert', 'rectangle']);
            }
            break;
          case 'oval':
            if (isInsertOval) {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insert', 'oval']);
            }
            break;
          case 'line':
            if (isInsertLine) {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insert', 'line']);
            }
            break;
          case 'text':
            if (isInsertText) {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insert', 'text']);
            }
            break;
          case 'slice':
            if (isInsertSlice) {
              dispatch('interaction', ['reset']);
            } else {
              dispatch('interaction', ['insert', 'slice']);
            }
            break;
          case 'vector':
            dispatch('interaction', ['drawingShapePath']);
            break;
        }
      }
    },
    [
      dispatch,
      isInsertArtboard,
      isInsertLine,
      isInsertOval,
      isInsertRectangle,
      isInsertSlice,
      isInsertText,
      isInsertComponentContainer,
    ],
  );

  const handleZoomMenuItem = useCallback(
    (type: ZoomMenuType) => {
      switch (type) {
        case 'zoomIn':
          dispatch('setZoom*', 2, 'multiply');
          break;
        case 'zoomOut':
          dispatch('setZoom*', 0.5, 'multiply');
          break;
        case 'zoomActualSize':
          dispatch('setZoom*', 1);
          break;
        case 'zoomToFitCanvas':
          dispatch('zoomToFit*', 'canvas');
          break;
        case 'zoomToFitSelection':
          dispatch('zoomToFit*', 'selection');
          break;
      }
    },
    [dispatch],
  );

  const handleInsertArtboard: KeyCommand = useCallback(() => {
    if (isInsertArtboard) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'artboard']);
    }
  }, [dispatch, isInsertArtboard]);

  const handleEnablePenTool = useCallback(() => {
    if (isCreatingPath) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['drawingShapePath']);
    }
  }, [isCreatingPath, dispatch]);

  useKeyboardShortcuts({
    'Mod-=': () => dispatch('setZoom*', 2, 'multiply'),
    'Mod-_': () => dispatch('setZoom*', 0.5, 'multiply'),
    ...(isEditingText
      ? {}
      : {
          f: handleInsertArtboard,
          p: handleEnablePenTool,
        }),
  });

  const fileName = fileHandle?.name ?? 'Untitled.sketch';

  const { compileFile } = useTypescriptCompiler();

  return (
    <>
      <Spacer.Horizontal size={itemSeparatorSize * 1.5} />
      <Tooltip content={fileName}>
        <DocumentTitle>{fileName.replace(/\.sketch$/, '')}</DocumentTitle>
      </Tooltip>
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
      <Spacer.Horizontal size={itemSeparatorSize * 4} />
      <Button
        onClick={() => {
          const result = compileFile(
            'test',
            `export default function MyComponent() {
  return <View background={"white"}></View>
}`,
          );

          console.info(getComponentInfo(result));
        }}
      >
        Test TS
      </Button>
    </>
  );
});

export default function Toolbar() {
  const [state] = useApplicationState();
  const { fileHandle } = useWorkspaceState();
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
      fileHandle={fileHandle}
    />
  );
}
