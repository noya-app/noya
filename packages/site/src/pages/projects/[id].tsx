import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, useNoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  Divider,
  lightTheme,
  Stack,
} from 'noya-designsystem';
import { getCurrentPlatform } from 'noya-keymap';
import React, { useEffect } from 'react';
import { Toolbar } from '../../components/Toolbar';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default function Project(): JSX.Element {
  const {
    query: { id },
  } = useRouter();
  const client = useNoyaClient();

  const [file, setFile] = React.useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    if (typeof id !== 'string') return;

    client.files.read(id).then(setFile);
  }, [client, id]);

  return (
    <DesignSystemConfigurationProvider platform={platform} theme={lightTheme}>
      <Stack.V flex="1" background={lightTheme.colors.canvas.background}>
        <Toolbar />
        <Divider variant="strong" />
        {file && <Ayon file={file} />}
      </Stack.V>
    </DesignSystemConfigurationProvider>
  );
}
