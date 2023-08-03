import { useApplicationState } from 'noya-app-state-context';
import { AyonAction } from './ayonReducer';

export function useAyonState() {
  return useApplicationState<AyonAction>();
}
