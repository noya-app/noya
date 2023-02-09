import { useRouter } from 'next/router';
import { NoyaAPI } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { amplitude } from 'noya-log';
import { encodeQueryParameters } from 'noya-utils';
import React, { useEffect, useMemo } from 'react';
import { NOYA_HOST } from '../../../utils/noyaClient';

function Content({
  shareId,
  name,
  networkClient,
}: {
  shareId: string;
  name?: string;
  networkClient: NoyaAPI.NetworkClient;
}) {
  const theme = useDesignSystemTheme();
  const router = useRouter();

  useEffect(() => {
    networkClient.files.create({ shareId }).then((fileId) => {
      amplitude.logEvent('Project - Created (From Share Duplication)');

      router.push(`/projects/${fileId}`);
    });
  }, [networkClient.files, router, shareId]);

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
          Duplicating {name || 'project'}
        </Small>
        <Spacer.Vertical size={4} />
        <Small color="text">This should only take a few seconds.</Small>
      </Stack.V>
    </Stack.V>
  );
}

export default function Duplicate() {
  const { query } = useRouter();
  const name = query.name as string | undefined;
  const shareId = query.shareId as string | undefined;

  const networkClient = useMemo(() => {
    return shareId
      ? new NoyaAPI.NetworkClient({
          baseURI: `${NOYA_HOST}/api`,
          onError: (error) => {
            if (
              error instanceof NoyaAPI.Error &&
              error.type === 'unauthorized'
            ) {
              window.location.href = `${NOYA_HOST}/api/auth/signin?${encodeQueryParameters(
                { callbackUrl: `/app/share/${shareId}/duplicate?name=${name}` },
              )}`;
              return true;
            }
            return false;
          },
        })
      : undefined;
  }, [name, shareId]);

  if (!shareId || !networkClient) return null;

  return (
    <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
      <Content shareId={shareId} name={name} networkClient={networkClient} />
    </DesignSystemConfigurationProvider>
  );
}
