import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider } from 'noya-api';
import {
  Button,
  DesignSystemConfigurationProvider,
  lightTheme,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ArrowRightIcon } from 'noya-icons';
import React, { useEffect, useState } from 'react';
import { Analytics } from '../../../components/Analytics';
import { addShareCookie } from '../../../utils/cookies';
import { createNoyaClient, NOYA_HOST } from '../../../utils/noyaClient';

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
  const theme = useDesignSystemTheme();
  const router = useRouter();

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
      <Stack.V
        flex="1"
        alignItems="center"
        justifyContent="center"
        background={theme.colors.canvas.background}
      >
        <Stack.V
          border={`1px solid ${theme.colors.dividerStrong}`}
          padding={20}
          background={theme.colors.sidebar.background}
          maxWidth={300}
        >
          <Small color="text" fontWeight="bold">
            Project not found
          </Small>
          <Spacer.Vertical size={4} />
          <Small color="text">
            This project may have been unshared. Contact the author to request
            access.
          </Small>
          <Spacer.Vertical size={16} />
          <Stack.H>
            <Button variant="secondary" onClick={() => router.push('/')}>
              Home
              <Spacer.Horizontal size={6} inline />
              <ArrowRightIcon />
            </Button>
          </Stack.H>
        </Stack.V>
      </Stack.V>
    );
  }

  if (!initialFile) {
    return null;
  }

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

function OptionalNoyaAPIProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<NoyaAPI.Client | undefined>();

  useEffect(() => {
    async function main() {
      try {
        if (!networkClient) return;
        await networkClient.auth.session();
        setClient(createNoyaClient());
      } catch {
        // Ignore
      }
    }

    main();
  }, []);

  if (client) {
    return (
      <NoyaAPIProvider value={client}>
        <Analytics>{children}</Analytics>
      </NoyaAPIProvider>
    );
  } else {
    return <>{children}</>;
  }
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
