import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from '@noya-app/noya-designsystem';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider, useNoyaClient } from 'noya-api';
import React, { useEffect, useMemo, useState } from 'react';
import { ProjectEditor } from '../../../components/ProjectEditor';
import { localStorageClient } from '../../../utils/noyaClient';

function Content({ id }: { id: string }) {
  const client = useNoyaClient();

  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    client.files.read(id).then(setInitialFile);
  }, [client, id]);

  if (!initialFile) return null;

  return <ProjectEditor initialFile={initialFile} viewType="preview" />;
}

export default function Preview() {
  const client = useNoyaClient();
  const { query } = useRouter();
  const id = query.id as string | undefined;

  const newClient = useMemo(() => {
    return new NoyaAPI.Client({
      networkClient:
        client.networkClient instanceof NoyaAPI.NetworkClient
          ? new NoyaAPI.NetworkClient({
              ...client.networkClient.options,
              isPreview: true,
            })
          : localStorageClient,
    });
  }, [client.networkClient]);

  if (!id) return null;

  return (
    <NoyaAPIProvider value={newClient}>
      <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
        <Content id={id} />
      </DesignSystemConfigurationProvider>
    </NoyaAPIProvider>
  );
}
