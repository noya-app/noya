import { fileOpen, fileSave } from 'browser-fs-access';
import { fileManager } from 'noya-embedded';
import { useMemo } from 'react';
import { useEnvironmentParameter } from './useEnvironmentParameters';

export function useFileManager() {
  const isElectron = useEnvironmentParameter('isElectron');

  return useMemo(
    () => ({
      open: isElectron ? fileManager.open : fileOpen,
      save: isElectron ? fileManager.save : fileSave,
    }),
    [isElectron],
  );
}
