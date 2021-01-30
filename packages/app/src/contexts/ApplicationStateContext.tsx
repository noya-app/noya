import { Action, ApplicationState } from 'ayano-state';
import { createContext, useContext } from 'react';

export type ApplicationStateContextValue = [
  ApplicationState,
  (action: Action) => void,
];

const ApplicationStateContext = createContext<
  ApplicationStateContextValue | undefined
>(undefined);

export const ApplicationStateProvider = ApplicationStateContext.Provider;

export const useApplicationState = () => {
  const value = useContext(ApplicationStateContext);

  if (!value) {
    throw new Error(`Missing ApplicationStateProvider`);
  }

  return value;
};

export const useCurrentPage = () => {
  const [state] = useApplicationState();

  const page = state.sketch.pages.find(
    (page) => page.do_objectID === state.selectedPage,
  );

  if (!page) {
    throw new Error('A page must always be selected');
  }

  return page;
};
