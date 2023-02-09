import { createContext, ReactNode, useContext } from 'react';

export type ProjectContextValue = {
  setLeftToolbar: (value: ReactNode) => void;
  setRightToolbar: (value: ReactNode) => void;
  setCenterToolbar: (value: ReactNode) => void;
};

const ProjectContext = createContext<ProjectContextValue>({
  setLeftToolbar: () => {},
  setRightToolbar: () => {},
  setCenterToolbar: () => {},
});

export const ProjectProvider = ProjectContext.Provider;

export function useProject() {
  return useContext(ProjectContext);
}
