import { ApplicationState } from '../index';
import { ThemeTab, WorkspaceTab } from '../reducers/applicationReducer';

export const getCurrentTab = (state: ApplicationState): WorkspaceTab => {
  return state.currentTab;
};

export const getCurrentComponentsTab = (state: ApplicationState): ThemeTab => {
  return state.currentThemeTab;
};
