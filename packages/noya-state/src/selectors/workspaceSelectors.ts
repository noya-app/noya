import { Draft } from 'immer';
import type {
  ApplicationState,
  ThemeTab,
  WorkspaceTab,
} from '../reducers/applicationReducer';

export const getCurrentTab = (
  state: ApplicationState | Draft<ApplicationState>,
): WorkspaceTab => {
  return state.currentTab;
};

export const getCurrentComponentsTab = (state: ApplicationState): ThemeTab => {
  return state.currentThemeTab;
};
