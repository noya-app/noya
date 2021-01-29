import {
  Action,
  ApplicationState,
  createInitialState,
  reducer,
} from 'ayano-state';
import { useCallback, useEffect, useReducer } from 'react';
import { parse, SketchFile } from 'sketch-zip';
import Workspace from './containers/Workspace';
import { useResource } from './hooks/useResource';
import { PromiseState } from './utils/PromiseState';

export default function App() {
  const sketchFile = useResource<ArrayBuffer>('/Oval.sketch', 'arrayBuffer');

  const [state, dispatch] = useReducer(
    (
      state: PromiseState<ApplicationState>,
      action:
        | { type: 'set'; value: SketchFile }
        | { type: 'update'; value: Action },
    ): PromiseState<ApplicationState> => {
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
              value: reducer(state.value, action.value),
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

  const handleDispatch = useCallback((action: Action) => {
    dispatch({ type: 'update', value: action });
  }, []);

  if (state.type !== 'success') return null;

  return <Workspace state={state.value} dispatch={handleDispatch} />;
}
