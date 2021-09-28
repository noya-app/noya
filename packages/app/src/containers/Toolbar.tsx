import { FileSystemHandle } from 'browser-fs-access';
import {
  useApplicationState,
  useDispatch,
  useSelector,
  useWorkspaceState,
} from 'noya-app-state-context';
import { hexToRgba } from 'noya-colorpicker';
import {
  Button,
  createSectionedMenu,
  DropdownMenu,
  MenuItem,
  RadioGroup,
  RegularMenuItem,
  rgbaToSketchColor,
  sketchColorToRgbaString,
  Spacer,
  Tooltip,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  ChevronDownIcon,
  PaintBucketIcon,
  Pencil1Icon,
  Pencil2Icon,
  PointModeIcon,
} from 'noya-icons';
import { KeyCommand, useKeyboardShortcuts } from 'noya-keymap';
import { SketchModel } from 'noya-sketch-model';
import {
  DrawableLayerType,
  InteractionState,
  InteractionType,
  Layers,
  Selectors,
} from 'noya-state';
import { isDeepEqual, round } from 'noya-utils';
import { memo, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { Square } from '../components/inspector/PickerAssetGrid';
import { LayerIcon } from './LayerList';

const DividerVertical = styled.div(({ theme }) => ({
  width: '1px',
  minWidth: '1px',
  maxWidth: '1px',
  height: '50%',
  background: theme.colors.divider,
}));

type InteractionStateProjection =
  | {
      type: 'insert';
      layerType: DrawableLayerType;
    }
  | Extract<InteractionState, { type: 'editBitmap' }>
  | { type: Exclude<InteractionType, 'insert' | 'editBitmap'> };

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
  canStartEditingBitmap: boolean;
  zoomValue: number;
  hasSelectedLayer: boolean;
  fileHandle?: FileSystemHandle;
}

const PALETTE = ['#ee8822', '#aa66ee', '#aa2277', '#2266cc', '#33aa88'];

const PALETTE_COLORS: Sketch.Color[] = PALETTE.map((hex) => hexToRgba(hex)).map(
  rgbaToSketchColor,
);

const COMMON_COLORS: Sketch.Color[] = [
  SketchModel.BLACK,
  SketchModel.WHITE,
  SketchModel.color({ red: 0, green: 0, blue: 0, alpha: 0 }),
];

const ToolbarContent = memo(function ToolbarContent({
  interactionStateProjection,
  canStartEditingPath,
  canStartEditingBitmap,
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

  const isInsertArtboard = isInsertingLayerType === 'artboard';
  const isInsertRectangle = isInsertingLayerType === 'rectangle';
  const isInsertOval = isInsertingLayerType === 'oval';
  const isInsertLine = isInsertingLayerType === 'line';
  const isInsertText = isInsertingLayerType === 'text';
  const isInsertSlice = isInsertingLayerType === 'slice';
  const isEditingPath = Selectors.getIsEditingPath(interactionType);
  const isEditingBitmap = Selectors.getIsEditingBitmap(interactionType);
  const isEditingText = Selectors.getIsEditingText(interactionType);
  const isCreatingPath = interactionType === 'drawingShapePath';

  const symbolsMenuItems = useSelector(Selectors.getSymbols).map((symbol) => ({
    title: symbol.name,
    value: `${SYMBOL_ITEM_PREFIX}${symbol.do_objectID}`,
  }));

  const shapeMenuItems: RegularMenuItem<InsertMenuLayerType>[] = [
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
    ],
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
    'Mod-=': () => dispatch('setZoom', 2, 'multiply'),
    'Mod-_': () => dispatch('setZoom', 0.5, 'multiply'),
    ...(isEditingText
      ? {}
      : {
          f: handleInsertArtboard,
          p: handleEnablePenTool,
        }),
  });

  const fileName = fileHandle?.name ?? 'Untitled.sketch';

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
      <Spacer.Horizontal size={itemSeparatorSize} />
      <Button
        id="edit-bitmap"
        tooltip="Edit Bitmap"
        active={isEditingBitmap}
        disabled={!(isEditingBitmap || canStartEditingBitmap)}
        onClick={useCallback(() => {
          if (!isEditingBitmap) {
            dispatch('interaction', [
              'editBitmap',
              { x: 0, y: 0 },
              SketchModel.BLACK,
            ]);
          } else {
            dispatch('interaction', ['reset']);
          }
        }, [isEditingBitmap, dispatch])}
      >
        {useMemo(
          () => (
            <Pencil2Icon />
          ),
          [],
        )}
      </Button>
      {interactionStateProjection.type === 'editBitmap' && (
        <>
          <Spacer.Horizontal size={itemSeparatorSize * 2} />
          <DividerVertical />
          <Spacer.Horizontal size={itemSeparatorSize} />
          <span style={{ width: '62px' }}>
            <InspectorPrimitives.Row>
              <RadioGroup.Root
                id={'bitmap-editing-tool'}
                value={interactionStateProjection.editBitmapTool}
                onValueChange={(value: 'pencil' | 'paintBucket') => {
                  dispatch('interaction', ['setBitmapEditingTool', value]);
                }}
              >
                <RadioGroup.Item value="pencil" tooltip="Pencil">
                  <Pencil1Icon />
                </RadioGroup.Item>
                <RadioGroup.Item value="paintBucket" tooltip="Paint Bucket">
                  <PaintBucketIcon />
                </RadioGroup.Item>
              </RadioGroup.Root>
            </InspectorPrimitives.Row>
          </span>
          <Spacer.Horizontal size={itemSeparatorSize} />
          <DividerVertical />
          <Spacer.Horizontal size={itemSeparatorSize} />
          {COMMON_COLORS.map((color, index) => (
            <Square
              key={index}
              background={
                color.alpha === 0
                  ? `linear-gradient(135deg, white 47%, rgba(255,0,0,1) 50%, white 53%)`
                  : sketchColorToRgbaString(color)
              }
              selected={isDeepEqual(
                interactionStateProjection.currentColor,
                color,
              )}
              onClick={() => {
                dispatch('interaction', ['setPencilColor', color]);
              }}
            />
          ))}
          <Spacer.Horizontal size={itemSeparatorSize} />
          <DividerVertical />
          <Spacer.Horizontal size={itemSeparatorSize} />
          {PALETTE_COLORS.map((color, index) => (
            <Square
              key={index}
              background={
                color.alpha === 0
                  ? `linear-gradient(135deg, white 47%, rgba(255,0,0,1) 50%, white 53%)`
                  : sketchColorToRgbaString(color)
              }
              selected={isDeepEqual(
                interactionStateProjection.currentColor,
                color,
              )}
              onClick={() => {
                dispatch('interaction', ['setPencilColor', color]);
              }}
            />
          ))}
          <Spacer.Horizontal size={itemSeparatorSize} />
        </>
      )}
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
        : state.interactionState.type === 'editBitmap'
        ? state.interactionState
        : { type: state.interactionState.type },
    [state.interactionState, layerType],
  );

  const selectedLayers = Selectors.getSelectedLayers(state);
  const canStartEditingPath =
    state.interactionState.type === 'none' &&
    selectedLayers.filter(Layers.isPointsLayer).length > 0;

  const canStartEditingBitmap =
    state.interactionState.type === 'none' &&
    selectedLayers.length === 1 &&
    Layers.isBitmapLayer(selectedLayers[0]);

  return (
    <ToolbarContent
      interactionStateProjection={projection}
      canStartEditingPath={canStartEditingPath}
      canStartEditingBitmap={canStartEditingBitmap}
      zoomValue={zoomValue}
      hasSelectedLayer={hasSelectedLayer}
      fileHandle={fileHandle}
    />
  );
}
