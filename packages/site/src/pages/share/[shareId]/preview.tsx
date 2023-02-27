import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import React, { useEffect, useState } from 'react';
import { Interstitial } from '../../../components/Interstitial';
import { OptionalNoyaAPIProvider } from '../../../components/OptionalNoyaAPIProvider';
import { addShareCookie } from '../../../utils/cookies';
import { NOYA_HOST } from '../../../utils/noyaClient';

const Ayon = dynamic(() => import('../../../components/Ayon'), { ssr: false });

/**
 * This client throws errors if the user isn't logged in
 */
const networkClient = NOYA_HOST
  ? new NoyaAPI.NetworkClient({
      baseURI: `${NOYA_HOST}/api`,
    })
  : undefined;

function Content({ shareId }: { shareId: string }) {
  const [initialFile, setInitialFile] = useState<
    NoyaAPI.SharedFile | undefined
  >();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    async function main() {
      if (!networkClient) return;

      try {
        const file = await networkClient.files.shares.readSharedFile(shareId);
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

  return (
    <Ayon
      fileId={shareId}
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
  const shareId = query.shareId as string | undefined;

  if (!shareId) return null;

  addShareCookie(shareId);

  return (
    <OptionalNoyaAPIProvider>
      <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
        <Content shareId={shareId} />
      </DesignSystemConfigurationProvider>
    </OptionalNoyaAPIProvider>
  );
}
