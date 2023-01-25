import { createContext, ReactNode, useContext } from 'react';

export type ProjectContextValue = {
  setRightToolbar: (value: ReactNode) => void;
  setCenterToolbar: (value: ReactNode) => void;
};

const ProjectContext = createContext<ProjectContextValue>({
  setCenterToolbar: () => {},
  setRightToolbar: () => {},
});

export const ProjectProvider = ProjectContext.Provider;

export function useProject() {
  return useContext(ProjectContext);
}
