import { Draft } from 'immer';
import { ApplicationState } from '../index';
import { ThemeTab, WorkspaceTab } from '../reducers/applicationReducer';

export const getCurrentTab = (
  state: ApplicationState | Draft<ApplicationState>,
): WorkspaceTab => {
  return state.currentTab;
};

export const getCurrentComponentsTab = (state: ApplicationState): ThemeTab => {
  return state.currentThemeTab;
};

export const getFillPopoverOpen = (state: ApplicationState): boolean => {
  return state.fillPopoverOpen;
};
