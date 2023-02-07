import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider, NoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  Divider,
  lightTheme,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ArrowRightIcon } from 'noya-icons';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Toolbar } from '../../components/Toolbar';
import { createNetworkClient, createNoyaClient } from '../../utils/noyaClient';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

const Chip = styled.span<{ variant: 'primary' | 'secondary' }>(
  ({ theme, variant }) => ({
    ...theme.textStyles.label,
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
const networkClient = createNetworkClient({
  onError: () => false,
});

function Content({ id }: { id: string }) {
  const theme = useDesignSystemTheme();
  const router = useRouter();

  const [initialFile, setInitialFile] = useState<
    NoyaAPI.SharedFile | undefined
  >();

  useEffect(() => {
    networkClient.files.shares.readSharedFile(id).then(setInitialFile);
  }, [id]);

  if (!initialFile) return null;

  return (
    <Stack.V flex="1" background={theme.colors.canvas.background}>
      <Toolbar>
        <Small>
          {initialFile.data.name}
          <Spacer.Horizontal size={8} inline />
          <Chip variant="secondary">VIEWING</Chip>
          {initialFile.fileId && (
            <>
              <Spacer.Horizontal size={8} inline />
              <Chip
                variant="primary"
                onClick={() => {
                  router.push(`/projects/${initialFile.fileId}`);
                }}
                style={{
                  cursor: 'pointer',
                }}
              >
                GO TO PROJECT
                <Spacer.Horizontal size={2} inline />
                <ArrowRightIcon
                  style={{
                    position: 'relative',
                    top: '-1px',
                    transform: 'scale(0.75)',
                    display: 'inline',
                  }}
                />
              </Chip>
            </>
          )}
        </Small>
      </Toolbar>
      <Divider variant="strong" />
      <Ayon
        fileId={id}
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
  const [client, setClient] = useState<NoyaClient | undefined>();

  useEffect(() => {
    async function main() {
      try {
        await networkClient.auth.session();
        setClient(createNoyaClient());
      } catch {
        // Ignore
      }
    }

    main();
  }, []);

  if (client) {
    return <NoyaAPIProvider value={client}>{children}</NoyaAPIProvider>;
  } else {
    return <>{children}</>;
  }
}

export default function Preview() {
  const { query } = useRouter();
  const id = query.id as string | undefined;

  if (!id) return null;

  return (
    <OptionalNoyaAPIProvider>
      <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
        <Content id={id} />
      </DesignSystemConfigurationProvider>
    </OptionalNoyaAPIProvider>
  );
}
