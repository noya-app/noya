import { NextRouter, useRouter } from 'next/router';
import { NoyaAPI, useNoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import { amplitude } from 'noya-log';
import React, { useEffect, useRef } from 'react';
import { Interstitial } from '../../../components/Interstitial';

async function duplicateFile(
  client: NoyaAPI.Client,
  id: string,
  router: NextRouter,
) {
  const newFileId = await client.files.create({ fileId: id });

  amplitude.logEvent('Project - Created (From Duplication)');

  // Update the name of the new file
  const newFile = await client.files.read(newFileId);

  await client.files.update(newFile.id, {
    ...newFile.data,
    name: `${newFile.data.name} Copy`,
  });

  router.push(`/projects/${newFile.id}`);
}

function Content({ fileId, name }: { fileId: string; name?: string }) {
  const router = useRouter();
  const client = useNoyaClient();

  // Ensure we only duplicate once
  const isDuplicating = useRef(false);

  useEffect(() => {
    if (isDuplicating.current) return;

    isDuplicating.current = true;

    duplicateFile(client, fileId, router);
  }, [client, fileId, router]);

  return (
    <Interstitial
      title={`Duplicating ${name || 'project'}`}
      description="This should only take a few seconds."
    />
  );
}

export default function Duplicate() {
  const { query } = useRouter();
  const name = query.name as string | undefined;
  const fileId = query.id as string | undefined;

  if (!fileId) return null;

  return (
    <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
      <Content fileId={fileId} name={name} />
    </DesignSystemConfigurationProvider>
  );
}
