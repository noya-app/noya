import {
  createInitialState,
  HistoryAction,
  historyReducer,
  HistoryState,
} from 'noya-state';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { parse, SketchFile } from 'noya-sketch-file';
import Workspace from './containers/Workspace';
import {
  ApplicationStateProvider,
  ApplicationStateContextValue,
} from './contexts/ApplicationStateContext';
import { useResource } from './hooks/useResource';
import { PromiseState } from './utils/PromiseState';

export default function App() {
  const sketchFile = useResource<ArrayBuffer>('/Demo.sketch', 'arrayBuffer');

  const [state, dispatch] = useReducer(
    (
      state: PromiseState<HistoryState>,
      action:
        | { type: 'set'; value: SketchFile }
        | { type: 'update'; value: HistoryAction },
    ): PromiseState<HistoryState> => {
      switch (action.type) {
        case 'set':
          return {
            type: 'success',
            value: createInitialState(action.value),
          };
        case 'update':
          if (state.type === 'success') {
            return {
              type: 'success',
              value: historyReducer(state.value, action.value),
            };
          } else {
            return state;
          }
      }
    },
    { type: 'pending' },
  );

  useEffect(() => {
    parse(sketchFile).then((parsed) => {
      dispatch({ type: 'set', value: parsed });
    });
  }, [sketchFile]);

  const handleDispatch = useCallback((action: HistoryAction) => {
    dispatch({ type: 'update', value: action });
  }, []);

  const contextValue: ApplicationStateContextValue | undefined = useMemo(
    () =>
      state.type === 'success' ? [state.value, handleDispatch] : undefined,
    [state, handleDispatch],
  );

  if (!contextValue) return null;

  return (
    <ApplicationStateProvider value={contextValue}>
      <Workspace />
    </ApplicationStateProvider>
  );
}
