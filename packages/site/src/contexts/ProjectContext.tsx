import { createContext, ReactNode, useContext } from 'react';

export type ProjectContextValue = {
  setRightToolbar: (value: ReactNode) => void;
  setCenterToolbar: (value: ReactNode) => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined,
);

export const ProjectProvider = ProjectContext.Provider;

export function useProject() {
  const value = useContext(ProjectContext);

  if (!value) {
    throw new Error('Missing ProjectContextValue');
  }

  return value;
}
