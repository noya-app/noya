import { CompletionItem } from '@noya-app/noya-designsystem';
import { createContext, ReactNode, useContext } from 'react';

export type ProjectContextValue = {
  setLeftToolbar: (value: ReactNode) => void;
  setRightToolbar: (value: ReactNode) => void;
  setCenterToolbar: (value: ReactNode) => void;
  setProjectPath: (value?: string) => void;
  setCommandPalette: (
    items: CompletionItem[],
    handler: (item: CompletionItem) => void,
  ) => void;
};

const ProjectContext = createContext<ProjectContextValue>({
  setLeftToolbar: () => {},
  setRightToolbar: () => {},
  setCenterToolbar: () => {},
  setProjectPath: () => {},
  setCommandPalette: () => {},
});

export const ProjectProvider = ProjectContext.Provider;

export function useProject() {
  return useContext(ProjectContext);
}
