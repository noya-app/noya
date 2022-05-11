import { useApplicationState } from 'noya-app-state-context';
import { useKeyCommands } from 'noya-keymap';
import { Selectors } from 'noya-state';

export function useArrowKeyShortcuts() {
  const [state, dispatch] = useApplicationState();

  const isEditingText = Selectors.getIsEditingText(state.interactionState.type);
  const isEditingPath = Selectors.getIsEditingPath(state.interactionState.type);

  const nudge = (axis: 'X' | 'Y', amount: number) => {
    if (isEditingPath && state.selectedControlPoint) {
      dispatch(`setControlPoint${axis}` as const, amount, 'adjust');
    } else if (isEditingPath) {
      dispatch(
        `setPoint${axis}` as const,
        state.selectedPointLists,
        amount,
        'adjust',
      );
    } else {
      dispatch(`setLayer${axis}` as const, amount, 'adjust');
    }
  };

  useKeyCommands(
    isEditingText
      ? {
          // Cursor movement
          ArrowLeft: () => dispatch('moveCursor', 'backward', 'character'),
          ArrowRight: () => dispatch('moveCursor', 'forward', 'character'),
          ArrowUp: () => dispatch('moveCursor', 'backward', 'vertical'),
          ArrowDown: () => dispatch('moveCursor', 'forward', 'vertical'),
          'Alt-ArrowLeft': () => dispatch('moveCursor', 'backward', 'word'),
          'Alt-ArrowRight': () => dispatch('moveCursor', 'forward', 'word'),
          'Mod-ArrowLeft': () => dispatch('moveCursor', 'backward', 'line'),
          'Mod-ArrowRight': () => dispatch('moveCursor', 'forward', 'line'),
          'Mod-ArrowUp': () => dispatch('moveCursor', 'backward', 'all'),
          'Mod-ArrowDown': () => dispatch('moveCursor', 'forward', 'all'),
          // Selection movement
          'Shift-ArrowLeft': () =>
            dispatch('moveTextSelection', 'backward', 'character'),
          'Shift-ArrowRight': () =>
            dispatch('moveTextSelection', 'forward', 'character'),
          'Shift-ArrowUp': () =>
            dispatch('moveTextSelection', 'backward', 'vertical'),
          'Shift-ArrowDown': () =>
            dispatch('moveTextSelection', 'forward', 'vertical'),
          'Shift-Alt-ArrowLeft': () =>
            dispatch('moveTextSelection', 'backward', 'word'),
          'Shift-Alt-ArrowRight': () =>
            dispatch('moveTextSelection', 'forward', 'word'),
          'Shift-Mod-ArrowLeft': () =>
            dispatch('moveTextSelection', 'backward', 'line'),
          'Shift-Mod-ArrowRight': () =>
            dispatch('moveTextSelection', 'forward', 'line'),
          'Shift-Mod-ArrowUp': () =>
            dispatch('moveTextSelection', 'backward', 'all'),
          'Shift-Mod-ArrowDown': () =>
            dispatch('moveTextSelection', 'forward', 'all'),
        }
      : {
          // Layer movement
          ArrowLeft: () => nudge('X', -1),
          ArrowRight: () => nudge('X', 1),
          ArrowUp: () => nudge('Y', -1),
          ArrowDown: () => nudge('Y', 1),
          'Shift-ArrowLeft': () => nudge('X', -10),
          'Shift-ArrowRight': () => nudge('X', 10),
          'Shift-ArrowUp': () => nudge('Y', -10),
          'Shift-ArrowDown': () => nudge('Y', 10),
        },
  );
}
