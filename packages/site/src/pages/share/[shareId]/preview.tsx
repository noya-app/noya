import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from '@noya-app/noya-designsystem';
import { useRouter } from 'next/router';
import { NoyaAPI } from 'noya-api';
import React, { useEffect, useState } from 'react';
import { Interstitial } from '../../../components/Interstitial';
import { ProjectEditor } from '../../../components/ProjectEditor';
import { addShareCookie } from '../../../utils/cookies';
import { networkClientThatThrows } from '../../../utils/noyaClient';

function Content({ shareId }: { shareId: string }) {
  const [initialFile, setInitialFile] = useState<
    NoyaAPI.SharedFile | undefined
  >();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    async function main() {
      if (!networkClientThatThrows) return;

      try {
        const file = await networkClientThatThrows.files.shares.readSharedFile(
          shareId,
        );
        setInitialFile(file);
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        }
      }
    }

    main();
  }, [shareId]);

  if (error) {
    return (
      <Interstitial
        title="Project not found"
        description="This project may have been unshared. Contact the author to request access."
        showHomeLink
      />
    );
  }

  if (!initialFile) return null;

  return <ProjectEditor initialFile={initialFile} viewType="preview" />;
}

export default function Preview() {
  const { query } = useRouter();
  const shareId = query.shareId as string | undefined;

  if (!shareId) return null;

  addShareCookie(shareId);

  return (
    <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
      <Content shareId={shareId} />
    </DesignSystemConfigurationProvider>
  );
}
