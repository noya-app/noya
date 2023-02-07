import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, useNoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import React, { useEffect, useState } from 'react';

const Ayon = dynamic(() => import('../../../components/Ayon'), { ssr: false });

function Content({ id }: { id: string }) {
  const client = useNoyaClient();

  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    client.files.read(id).then(setInitialFile);
  }, [client, id]);

  if (!initialFile) return null;

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
  const { query } = useRouter();
  const id = query.id as string | undefined;

  if (!id) return null;

  return (
    <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
      <Content id={id} />
    </DesignSystemConfigurationProvider>
  );
}
