import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider } from 'noya-api';
import {
  Button,
  DesignSystemConfigurationProvider,
  Divider,
  lightTheme,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ArrowRightIcon } from 'noya-icons';
import { amplitude } from 'noya-log';
import { Layers } from 'noya-state';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Analytics } from '../../components/Analytics';
import { Toolbar } from '../../components/Toolbar';
import { addShareCookie } from '../../utils/cookies';
import { createNoyaClient, NOYA_HOST } from '../../utils/noyaClient';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

const Chip = styled.span<{ variant: 'primary' | 'secondary' }>(
  ({ theme, variant }) => ({
    ...theme.textStyles.label,
    lineHeight: 'inherit',
    padding: '4px',
    borderRadius: 4,
    userSelect: 'none',
    ...(variant === 'primary' && {
      color: theme.colors.primary,
      background: 'rgb(238, 229, 255)',
    }),
    ...(variant === 'secondary' && {
      color: theme.colors.secondary,
      background: 'rgb(205, 238, 231)',
    }),
  }),
);

/**
 * This client throws errors if the user isn't logged in
 */
const networkClient = NOYA_HOST
  ? new NoyaAPI.NetworkClient({
      baseURI: `${NOYA_HOST}/api`,
    })
  : undefined;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (!networkClient) return;

  let shareId: string | null = null,
    initialFile: NoyaAPI.SharedFile | null = null,
    error: Error | null = null;

  try {
    shareId = context.params!.shareId as string;
    const file = await networkClient.files.shares.readSharedFile(shareId);
    initialFile = file;
  } catch (readFileError) {
    if (readFileError instanceof Error) {
      error = readFileError;
    }
  }

  return {
    props: {
      shareId,
      initialFile,
      error,
    },
  };
}

function Content({
  shareId,
  initialFile,
  error,
}: {
  shareId: string;
  initialFile: NoyaAPI.SharedFile;
  error: Error;
}) {
  const theme = useDesignSystemTheme();
  const router = useRouter();

  const [fileId, setFileId] = useState<string | undefined>();

  useEffect(() => {
    async function main() {
      if (!networkClient) return;

      try {
        const file = await networkClient.files.shares.readSharedFile(shareId);
        setFileId(file.fileId);
      } catch (error) {}
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

  const artboard = Layers.find(
    initialFile.data.document.pages[0],
    Layers.isArtboard,
  );

  return (
    <Stack.V flex="1" background={theme.colors.canvas.background}>
      <Head>
        <meta name="description" content="Created with Noya" />
        {artboard && (
          <>
            <meta
              property="og:url"
              content={`${NOYA_HOST}/app/share/${initialFile.id}`}
            />
            <meta property="og:title" content={initialFile.data.name} />
            <meta property="og:description" content="Created with Noya" />
            <meta
              property="og:image"
              content={`${networkClient?.baseURI}/shares/${initialFile.id}.png?width=${artboard.frame.width}&height=${artboard.frame.height}`}
            />
            <meta
              property="og:image:width"
              content={`${artboard.frame.width}`}
            />
            <meta
              property="og:image:height"
              content={`${artboard.frame.height}`}
            />
            <meta property="og:image:user_generated" content="true" />
            <meta property="og:type" content="article" />
            <meta
              property="og:article:published_time"
              content={`${initialFile.createdAt}`}
            />
            <meta
              property="og:article:modified_time"
              content={`${initialFile.updatedAt}`}
            />
          </>
        )}
      </Head>
      <Toolbar>
        <Small>{initialFile.data.name}</Small>
        <Spacer.Horizontal size={8} inline />
        <Chip variant="secondary">VIEWING</Chip>
        {fileId && (
          <>
            <Spacer.Horizontal size={8} inline />
            <Chip
              variant="primary"
              onClick={() => {
                router.push(`/projects/${fileId}`);
              }}
              style={{
                cursor: 'pointer',
              }}
            >
              GO TO MY PROJECT
              <Spacer.Horizontal size={2} inline />
              <ArrowRightIcon
                style={{
                  display: 'inline-block',
                  height: '11px',
                }}
              />
            </Chip>
          </>
        )}
        {!fileId && initialFile.duplicable && (
          <>
            <Spacer.Horizontal size={8} inline />
            <Chip
              variant="primary"
              onClick={() => {
                amplitude.logEvent('Share - Started Duplication');

                router.push(
                  `/share/${shareId}/duplicate?name=${initialFile.data.name}`,
                );
              }}
              style={{
                cursor: 'pointer',
              }}
            >
              DUPLICATE THIS PROJECT
              <Spacer.Horizontal size={2} inline />
              <ArrowRightIcon
                style={{
                  display: 'inline-block',
                  height: '11px',
                }}
              />
            </Chip>
          </>
        )}
      </Toolbar>
      <Divider variant="strong" />
      <Ayon
        fileId={shareId}
        canvasRendererType="svg"
        initialDocument={initialFile.data.document}
        name={initialFile.data.name}
        uploadAsset={async () => ''}
        viewType="previewOnly"
      />
    </Stack.V>
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

export default function Preview({
  shareId,
  initialFile,
  error,
}: {
  shareId: string;
  initialFile: NoyaAPI.SharedFile;
  error: Error;
}) {
  useEffect(() => {
    amplitude.logEvent('Share - Opened');
  }, []);

  if (!shareId) return null;

  addShareCookie(shareId);

  return (
    <OptionalNoyaAPIProvider>
      <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
        <Content shareId={shareId} initialFile={initialFile} error={error} />
      </DesignSystemConfigurationProvider>
    </OptionalNoyaAPIProvider>
  );
}
