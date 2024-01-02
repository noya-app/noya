import { Point, Rect } from '@noya-app/noya-geometry';
import {
  useApplicationState,
  useHistory,
  useWorkspace,
} from 'noya-app-state-context';
import {
  ReactEventHandlers,
  createSectionedMenu,
  mergeEventHandlers,
  usePlatform,
  usePlatformModKey,
} from 'noya-designsystem';
import { KeyMap, handleKeyboardEvent } from 'noya-keymap';
import { ILogEvent } from 'noya-log';
import { OffsetPoint } from 'noya-react-utils';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import {
  CompassDirection,
  InteractionState,
  LayerTraversalOptions,
  Layers,
  Selectors,
  SetNumberMode,
  TextEditorCursorDirection,
  TextEditorCursorUnit,
  TextSelectionRange,
  getCurrentPage,
} from 'noya-state';
import { CSSProperties, useMemo } from 'react';
import { ZERO_INSETS } from '../components/CanvasElement';
import { ICanvasElement } from '../components/types';
import { useMultipleClickCount } from '../hooks/useMultipleClickCount';
import { ClipboardActions } from '../interactions/clipboard';
import { DrawingActions } from '../interactions/drawing';
import { DuplicateActions } from '../interactions/duplicate';
import { EditBlockActions } from '../interactions/editBlock';
import { EditTextActions } from '../interactions/editText';
import { EscapeActions } from '../interactions/escape';
import { HistoryActions } from '../interactions/history';
import { InsertModeActions } from '../interactions/insertMode';
import { MarqueeActions } from '../interactions/marquee';
import { MoveActions } from '../interactions/move';
import { PanActions } from '../interactions/pan';
import { ReorderActions } from '../interactions/reorder';
import { ScaleActions } from '../interactions/scale';
import { SelectionActions } from '../interactions/selection';
import { SelectionModeActions } from '../interactions/selectionMode';
import { InteractionAPI } from '../interactions/types';
import { ZoomActions } from '../interactions/zoom';
import { convertPoint } from '../utils/convertPoint';

function getPoint(event: OffsetPoint): Point {
  return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
}

export type Actions = MarqueeActions &
  SelectionActions &
  MoveActions &
  ScaleActions &
  DrawingActions &
  PanActions &
  EditBlockActions &
  EditTextActions &
  ClipboardActions &
  EscapeActions &
  ReorderActions &
  HistoryActions &
  ZoomActions &
  DuplicateActions &
  InsertModeActions &
  SelectionModeActions;

export type Interaction = (
  actions: Actions,
) => (
  state: InteractionState,
  key: InteractionState['type'],
  api: InteractionAPI,
) => ReactEventHandlers;

interface Props {
  interactions?: Interaction[];
  elementInterface: ICanvasElement;
  logEvent: ILogEvent;
}

export function useInteractionHandlers({
  interactions = [],
  elementInterface,
  logEvent,
}: Props) {
  const [state, dispatch] = useApplicationState();
  const { highlightedLayer } = useWorkspace();
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const platform = usePlatform();
  const platformModKey = usePlatformModKey();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;
  const { getClickCount, setLatestClick } = useMultipleClickCount();
  const textSelection = Selectors.getTextSelection(state);
  const { canUndo, canRedo } = useHistory();

  const actions = useMemo((): Actions => {
    return {
      zoomIn: () => dispatch('setZoom*', 2, 'multiply'),
      zoomOut: () => dispatch('setZoom*', 0.5, 'multiply'),
      zoomActualSize: () => dispatch('setZoom*', 1),
      zoomToFitCanvas: () => dispatch('zoomToFit*', 'canvas', { padding: 20 }),
      zoomToFitSelection: () =>
        dispatch('zoomToFit*', 'selection', { padding: 20 }),
      undo: () => dispatch('undo'),
      redo: () => dispatch('redo'),
      maybeMarquee: (point, method) =>
        dispatch('interaction', ['maybeMarquee', point, method]),
      startMarquee: (point, selectedIds) =>
        dispatch('interaction', ['startMarquee', point, selectedIds]),
      updateMarquee: (point) =>
        dispatch('interaction', ['updateMarquee', point]),
      reset: () => dispatch('interaction', ['reset']),
      selectLayer: (layerId, selectionType) =>
        dispatch('selectLayer', layerId, selectionType),
      deleteLayer: (layerId) => dispatch('deleteLayer', layerId),
      maybeMove: (point) => dispatch('interaction', ['maybeMove', point]),
      updateMoving: (point, inferBlockType) =>
        dispatch('interaction', ['updateMoving', point, inferBlockType]),
      maybeScale: (point, direction) =>
        dispatch('interaction', ['maybeScale', point, direction]),
      updateScaling: (point, options, inferBlockType) =>
        dispatch('interaction', [
          'updateScaling',
          point,
          options,
          inferBlockType,
        ]),
      addDrawnLayer: () => dispatch('addDrawnLayer'),
      maybeDrawing: (point) => dispatch('interaction', ['maybeDrawing', point]),
      startDrawing: (layerType, point) =>
        dispatch('interaction', ['startDrawing', layerType, point]),
      updateDrawing: (point, options, layerType) =>
        dispatch('interaction', ['updateDrawing', point, options, layerType]),
      pan: (point) => dispatch('pan*', point),
      startPanning: (point) => dispatch('interaction', ['startPanning', point]),
      updatePanning: (point) =>
        dispatch('interaction', ['updatePanning', point]),
      maybePan: (point) => dispatch('interaction', ['maybePan', point]),
      enablePanMode: () => dispatch('interaction', ['enablePanMode']),
      hoverHandle: (direction?: CompassDirection) =>
        dispatch('interaction', ['hoverHandle', direction]),
      startEditingBlock: (layerId) => {
        dispatch('selectLayer', [layerId]);
        dispatch('interaction', ['editingBlock', layerId]);
      },
      startEditingText: (id: string, range: TextSelectionRange) =>
        dispatch('interaction', ['editingText', id, range]),
      setTextSelection: (range: TextSelectionRange) =>
        dispatch('setTextSelection', range),
      maybeSelectText: (point: Point) =>
        dispatch('interaction', ['maybeSelectText', point]),
      selectingText: (point: Point) =>
        dispatch('interaction', ['selectingText', point]),
      selectContainingText: (
        id: string,
        characterIndex: number,
        unit: 'word' | 'line',
      ) => dispatch('selectContainingText', id, characterIndex, unit),
      selectAllText: (id: string) => dispatch('selectAllText', id),
      insertText: (text: string) => dispatch('insertText', text),
      deleteText: (
        direction: TextEditorCursorDirection,
        unit: TextEditorCursorUnit,
      ) => dispatch('deleteText', direction, unit),
      moveCursor: (
        direction: TextEditorCursorDirection,
        unit: TextEditorCursorUnit,
      ) => dispatch('moveCursor', direction, unit),
      moveTextSelection: (
        direction: TextEditorCursorDirection,
        unit: TextEditorCursorUnit,
      ) => dispatch('moveTextSelection', direction, unit),
      setLayerX: (value: number, mode: SetNumberMode) =>
        dispatch('setLayerX', value, mode),
      setLayerY: (value: number, mode: SetNumberMode) =>
        dispatch('setLayerY', value, mode),
      selectAllLayers: () => dispatch('selectAllLayers'),
      addLayer: (layer, options) => dispatch('addLayer', layer, options),
      highlightLayer: (layerHighlight) =>
        dispatch('highlightLayer', layerHighlight),
      enterInsertMode: (layerType, method) =>
        dispatch('interaction', ['insert', layerType, method]),
      enterSelectionMode: (method) =>
        dispatch('interaction', ['enableSelectionMode', method]),
      bringToFront: (id: string[]) => dispatch('bringToFront', id),
      sendToBack: (id: string[]) => dispatch('sendToBack', id),
      duplicateLayer: (id: string[]) =>
        dispatch('duplicateLayer', id, {
          incrementName: false,
        }),
      moveLayersIntoParentAtPoint: (point) =>
        dispatch('moveLayersIntoParentAtPoint', point),
      setCursor: (cursor: CSSProperties['cursor'] | undefined) =>
        dispatch('interaction', ['setCursor', cursor]),
      duplicateAndUpdateMoving: (ids, point, inferBlockType) => {
        dispatch('duplicateLayer', ids, { incrementName: false });
        dispatch('interaction', ['reset']);
        dispatch('interaction', ['maybeMove', point]);
        dispatch('interaction', ['updateMoving', point, inferBlockType]);
      },
    };
  }, [dispatch]);

  const api = useMemo((): InteractionAPI => {
    return {
      ...elementInterface,
      platform,
      platformModKey,
      zoomValue,
      getClickCount,
      selectedLayerIds: state.selectedLayerIds,
      selectedGradient: state.selectedGradient,
      isolatedLayerId: state.isolatedLayerId,
      highlightedLayerId: highlightedLayer?.id,
      textSelection,
      canRedo,
      canUndo,
      siblingBlocks: Selectors.getSiblingBlocks(state),
      convertPoint: (point, system) =>
        convertPoint(scrollOrigin, zoomValue, point, system),
      getScreenPoint: getPoint,
      getCanvasPoint: (input: OffsetPoint) =>
        convertPoint(scrollOrigin, zoomValue, getPoint(input), 'canvas'),
      getLayerPoint: (layerId: string, input: OffsetPoint) =>
        convertPoint(scrollOrigin, zoomValue, getPoint(input), {
          layerId,
          page: getCurrentPage(state),
        }),
      getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => {
        const layers = Selectors.getLayersInRect(
          state,
          getCurrentPage(state),
          ZERO_INSETS,
          rect,
          options,
        );

        return layers.map((layer) => layer.do_objectID);
      },
      getLayerIdAtPoint: (point: Point, options?: LayerTraversalOptions) => {
        return Selectors.getLayerAtPoint(
          CanvasKit,
          fontManager,
          state,
          ZERO_INSETS,
          point,
          options,
        )?.do_objectID;
      },
      getLayerTypeById: (id: string) => {
        return Layers.find(
          getCurrentPage(state),
          (layer) => layer.do_objectID === id,
        )!._class;
      },
      getScaleDirectionAtPoint: (point: Point) =>
        Selectors.getScaleDirectionAtPoint(state, point),
      getCharacterIndexAtPoint: (layerId, point, mode) =>
        Selectors.getCharacterIndexAtPoint(
          CanvasKit,
          fontManager,
          state,
          layerId,
          point,
          mode,
        ),
      getCharacterIndexAtPointInSelectedLayer: (point, mode) =>
        Selectors.getCharacterIndexAtPointInSelectedLayer(
          CanvasKit,
          fontManager,
          state,
          point,
          mode,
        ),
      handleKeyboardEvent: (keyMap) => (event) =>
        handleKeyboardEvent(event.nativeEvent, api.platform, keyMap),
      getTextLength: (layerId) => {
        const layer = Layers.find(
          getCurrentPage(state),
          (layer) => layer.do_objectID === layerId,
        );

        if (layer && Layers.isTextLayer(layer)) {
          return layer.attributedString.string.length;
        } else {
          return 0;
        }
      },
      logEvent,
    };
  }, [
    CanvasKit,
    canRedo,
    canUndo,
    elementInterface,
    fontManager,
    getClickCount,
    highlightedLayer?.id,
    logEvent,
    platform,
    platformModKey,
    scrollOrigin,
    state,
    textSelection,
    zoomValue,
  ]);

  const handlers = interactions.map((interaction) =>
    interaction(actions)(
      state.interactionState,
      state.interactionState.type,
      api,
    ),
  );

  const onSelectMenuItem = (item: string) => {
    handlers.map(
      (handler) => handler.onSelectMenuItem && handler.onSelectMenuItem(item),
    );
  };

  const menuItems = createSectionedMenu(
    ...handlers.map((handler) =>
      handler.onContributeMenuItems ? handler.onContributeMenuItems() : [],
    ),
  );

  const keyboardShortcuts = handlers.reduce<KeyMap>(
    (result, handler) => ({ ...result, ...handler.keyboardShortcuts }),
    {},
  );

  const domHandlers = handlers.map((handler) => {
    const {
      onContributeMenuItems,
      onSelectMenuItem,
      keyboardShortcuts,
      ...rest
    } = handler;
    return rest;
  });

  return {
    api,
    actions,
    handlers: mergeEventHandlers(
      {
        onPointerDown: (event) => {
          setLatestClick(getPoint(event.nativeEvent));
        },
      },
      ...domHandlers,
    ),
    menuItems,
    onSelectMenuItem,
    keyboardShortcuts,
  };
}
