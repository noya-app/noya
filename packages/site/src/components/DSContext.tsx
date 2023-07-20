import { DS, useNoyaClient } from 'noya-api';
import Sketch from 'noya-file-format';
import React, { useEffect, useMemo, useState } from 'react';

const useDSReference = (fileId: string | undefined) => {
  const client = useNoyaClient();

  const [ds, setDS] = useState<DS | undefined>();

  useEffect(() => {
    let mounted = true;

    if (!fileId) {
      setDS(undefined);
      return;
    }

    // Load the latest version of this file from the server
    client.files.read(fileId).then((file) => {
      if (!mounted) return;

      if (file.data.type === 'io.noya.ds') {
        setDS(file.data.document);
      }
    });

    return () => {
      mounted = false;
    };
  }, [client, fileId]);

  return ds;
};

export const DSContext = React.createContext<DS | undefined>(undefined);

const DEFAULT_DESIGN_SYSTEM: Sketch.DesignSystem = {
  type: 'standard',
  id: '@noya-design-system/chakra',
};

export const DSProvider = function DSProvider({
  children,
  savedDesignSystem,
}: {
  children: React.ReactNode;
  savedDesignSystem?: Sketch.DesignSystem;
}) {
  const savedOrDefault = savedDesignSystem ?? DEFAULT_DESIGN_SYSTEM;

  const customDS = useDSReference(
    savedOrDefault.type === 'custom' ? savedOrDefault.id : undefined,
  );

  const standardDS = useMemo(() => {
    if (savedOrDefault.type !== 'standard') return undefined;

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
  }, [savedOrDefault.id, savedOrDefault.type]);

  return (
    <DSContext.Provider
      value={savedOrDefault.type === 'standard' ? standardDS : customDS}
    >
      {children}
    </DSContext.Provider>
  );
};

export const useDS = () => {
  return React.useContext(DSContext);
};
