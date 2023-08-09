import { useApplicationState, useDispatch } from 'noya-app-state-context';
import { AyonAction } from './ayonReducer';

export function useAyonState() {
  return useApplicationState<AyonAction>();
}

export function useAyonDispatch() {
  return useDispatch<AyonAction>();
}
