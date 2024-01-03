import { ReactEventHandlers } from '@noya-app/noya-designsystem';
import { Point } from '@noya-app/noya-geometry';
import {
  handleActionType,
  InteractionState,
  Selectors,
  TextEditorCursorDirection,
  TextEditorCursorUnit,
  TextSelectionRange,
} from 'noya-state';
import { isMoving } from '../utils/isMoving';
import { InteractionAPI } from './types';

export interface EditTextActions {
  insertText: (text: string) => void;
  deleteText: (
    direction: TextEditorCursorDirection,
    unit: TextEditorCursorUnit,
  ) => void;
  startEditingText: (id: string, range: TextSelectionRange) => void;
  setTextSelection: (range: TextSelectionRange) => void;
  maybeSelectText: (point: Point) => void;
  selectingText: (point: Point) => void;
  selectContainingText: (
    id: string,
    characterIndex: number,
    unit: 'word' | 'line',
  ) => void;
  selectAllText: (id: string) => void;
  moveCursor: (
    direction: TextEditorCursorDirection,
    unit: TextEditorCursorUnit,
  ) => void;
  moveTextSelection: (
    direction: TextEditorCursorDirection,
    unit: TextEditorCursorUnit,
  ) => void;
  reset: () => void;
}

export function editTextInteraction({
  insertText,
  deleteText,
  startEditingText,
  setTextSelection,
  maybeSelectText,
  selectingText,
  selectAllText,
  selectContainingText,
  moveCursor,
  moveTextSelection,
  reset,
}: EditTextActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        if (api.getClickCount() < 2) return;

        if (api.selectedLayerIds.length === 0) return;

        const layerId = api.selectedLayerIds[0];

        if (api.getLayerTypeById(layerId) !== 'text') return;

        const length = api.getTextLength(layerId);

        startEditingText(layerId, { anchor: 0, head: length });

        const canvasPoint = api.getCanvasPoint(event.nativeEvent);

        const characterIndex = api.getCharacterIndexAtPoint(
          layerId,
          canvasPoint,
          'bounded',
        );

        if (characterIndex === undefined) {
          selectAllText(layerId);
        } else {
          selectContainingText(
            layerId,
            characterIndex,
            api.getClickCount() % 2 === 0 ? 'word' : 'line',
          );
        }

        event.preventDefault();
      },
    }),
    editingText: (interactionState, api) => ({
      onPointerDown: (event) => {
        if (api.selectedLayerIds.length === 0) return;

        const layerId = api.selectedLayerIds[0];

        if (api.getLayerTypeById(layerId) !== 'text') return;

        const canvasPoint = api.getCanvasPoint(event.nativeEvent);

        const characterIndex = api.getCharacterIndexAtPoint(
          layerId,
          canvasPoint,
          'bounded',
        );

        if (api.getClickCount() >= 2) {
          if (characterIndex === undefined) {
            selectAllText(layerId);
          } else {
            selectContainingText(
              layerId,
              characterIndex,
              api.getClickCount() % 2 === 0 ? 'word' : 'line',
            );
          }

          event.preventDefault();
        } else if (characterIndex !== undefined) {
          setTextSelection({ anchor: characterIndex, head: characterIndex });
          maybeSelectText(canvasPoint);
        } else {
          reset();
        }
      },
      onBeforeInput: (event) => {
        if (typeof event.data === 'string') {
          insertText(event.data);
        } else {
          switch (event.inputType) {
            case 'insertLineBreak':
              insertText('\n');
              break;
            // Delete
            case 'deleteContent':
            case 'deleteContentForward':
            case 'deleteContentBackward':
            case 'deleteEntireSoftLine':
            case 'deleteHardLineBackward':
            case 'deleteSoftLineBackward':
            case 'deleteHardLineForward':
            case 'deleteSoftLineForward':
            case 'deleteWordBackward':
            case 'deleteWordForward':
              deleteText(
                ...Selectors.getDeletionParametersForInputEvent(
                  event.inputType,
                ),
              );
          }
        }
      },
      keyboardShortcuts: {
        // Cursor movement
        ArrowLeft: () => moveCursor('backward', 'character'),
        ArrowRight: () => moveCursor('forward', 'character'),
        ArrowUp: () => moveCursor('backward', 'vertical'),
        ArrowDown: () => moveCursor('forward', 'vertical'),
        'Alt-ArrowLeft': () => moveCursor('backward', 'word'),
        'Alt-ArrowRight': () => moveCursor('forward', 'word'),
        'Mod-ArrowLeft': () => moveCursor('backward', 'line'),
        'Mod-ArrowRight': () => moveCursor('forward', 'line'),
        'Mod-ArrowUp': () => moveCursor('backward', 'all'),
        'Mod-ArrowDown': () => moveCursor('forward', 'all'),
        // Selection movement
        'Shift-ArrowLeft': () => moveTextSelection('backward', 'character'),
        'Shift-ArrowRight': () => moveTextSelection('forward', 'character'),
        'Shift-ArrowUp': () => moveTextSelection('backward', 'vertical'),
        'Shift-ArrowDown': () => moveTextSelection('forward', 'vertical'),
        'Shift-Alt-ArrowLeft': () => moveTextSelection('backward', 'word'),
        'Shift-Alt-ArrowRight': () => moveTextSelection('forward', 'word'),
        'Shift-Mod-ArrowLeft': () => moveTextSelection('backward', 'line'),
        'Shift-Mod-ArrowRight': () => moveTextSelection('forward', 'line'),
        'Shift-Mod-ArrowUp': () => moveTextSelection('backward', 'all'),
        'Shift-Mod-ArrowDown': () => moveTextSelection('forward', 'all'),
      },
    }),
    maybeSelectingText: (interactionState, api) => ({
      onPointerMove: (event) => {
        const canvasPoint = api.getCanvasPoint(event.nativeEvent);

        const { origin } = interactionState;

        if (isMoving(canvasPoint, origin, api.zoomValue)) {
          selectingText(canvasPoint);
        }

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onPointerUp: (event) => {
        if (!api.textSelection) {
          reset();
          event.preventDefault();
          return;
        }

        startEditingText(api.textSelection.layerId, api.textSelection.range);

        api.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
      },
    }),
    selectingText: (interactionState, api) => ({
      onPointerMove: (event) => {
        if (!api.textSelection) return;

        const canvasPoint = api.getCanvasPoint(event.nativeEvent);

        const characterIndex = api.getCharacterIndexAtPointInSelectedLayer(
          canvasPoint,
          'unbounded',
        );

        if (characterIndex !== undefined) {
          setTextSelection({
            anchor: api.textSelection.range.anchor,
            head: characterIndex,
          });
          event.preventDefault();
        }
      },
      onPointerUp: (event) => {
        if (!api.textSelection) {
          reset();
          event.preventDefault();
          return;
        }

        const canvasPoint = api.getCanvasPoint(event.nativeEvent);

        const characterIndex = api.getCharacterIndexAtPointInSelectedLayer(
          canvasPoint,
          'bounded',
        );

        startEditingText(api.textSelection.layerId, api.textSelection.range);

        if (characterIndex !== undefined) {
          setTextSelection({
            anchor: api.textSelection.range.anchor,
            head: characterIndex,
          });
        }
      },
    }),
  });
}
