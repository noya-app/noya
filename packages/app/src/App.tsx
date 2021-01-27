import {
  Action,
  ApplicationState,
  createInitialState,
  reducer,
} from 'ayano-state';
import { useEffect, useReducer } from 'react';
import { parse, SketchFile } from 'sketch-zip';
import './App.css';
import Canvas from './Canvas';
import { useResource } from './hooks/useResource';
import { PromiseState } from './utils/PromiseState';

export default function App() {
  const sketchFile = useResource<ArrayBuffer>(
    '/Rectangle.sketch',
    'arrayBuffer',
  );

  const [state, dispatch] = useReducer(
    (
      state: PromiseState<ApplicationState>,
      action: { type: 'set'; value: SketchFile } | Action,
    ): PromiseState<ApplicationState> => {
      if (action.type === 'set') {
        return {
          type: 'success',
          value: createInitialState(action.value),
        };
      }

      if (state.type === 'success') {
        return {
          type: 'success',
          value: reducer(state.value, action),
        };
      }

      return state;
    },
    { type: 'pending' },
  );

  useEffect(() => {
    parse(sketchFile).then((parsed) => {
      dispatch({ type: 'set', value: parsed });
    });
  }, [sketchFile]);

  if (state.type !== 'success') return null;

  return (
    <Canvas
      state={state.value}
      dispatch={(action) => {
        dispatch(action);
      }}
    />
  );
}
