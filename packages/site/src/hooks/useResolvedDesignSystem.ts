import { DS, useNoyaFiles } from 'noya-api';
import Sketch from 'noya-file-format';
import { useMemo } from 'react';

const DEFAULT_DESIGN_SYSTEM: Sketch.DesignSystem = {
  type: 'standard',
  id: '@noya-design-system/chakra',
};

export function useResolvedDesignSystem(
  savedDesignSystem?: Sketch.DesignSystem,
) {
  const { files } = useNoyaFiles();

  const savedOrDefault = savedDesignSystem ?? DEFAULT_DESIGN_SYSTEM;

  const designSystem: DS | undefined = useMemo(() => {
    switch (savedOrDefault.type) {
      case 'standard': {
        const result: DS = {
          source: {
            name: savedOrDefault.id,
            version: 'latest',
            type: 'npm',
          },
          config: {
            colors: {
              primary: 'blue',
            },
          },
        };

        return result;
      }
      case 'custom': {
        const file = files.find((file) => file.id === savedOrDefault.id);

        if (!file || file.data.type !== 'io.noya.ds') {
          console.error(
            `Could not find custom design system with id ${savedOrDefault.id}`,
          );
          return;
        }

        return file.data.document;
      }
    }
  }, [files, savedOrDefault.id, savedOrDefault.type]);

  return designSystem;
}
