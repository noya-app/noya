import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider, useNoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import React, { useEffect, useMemo, useState } from 'react';
import { DSEditor } from '../../../dseditor/DSEditor';
import { localStorageClient } from '../../../utils/noyaClient';

const Ayon = dynamic(
  () => import('../../../components/Ayon').then((mod) => mod.Ayon),
  { ssr: false },
);

function Content({ id }: { id: string }) {
  const client = useNoyaClient();

  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    client.files.read(id).then(setInitialFile);
  }, [client, id]);

  if (!initialFile) return null;

  if (initialFile.data.type === 'io.noya.ds') {
    return (
      <DSEditor
        initialDocument={initialFile.data.document}
        name={initialFile.data.name}
        viewType="preview"
      />
    );
  }

  return (
    <Ayon
      fileId={id}
      canvasRendererType="svg"
      initialDocument={initialFile.data.document}
      name={initialFile.data.name}
      uploadAsset={async () => ''}
      viewType="previewOnly"
    />
  );
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
