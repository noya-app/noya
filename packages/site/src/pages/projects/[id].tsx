import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, useNoyaClient, useNoyaFiles } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  Divider,
  lightTheme,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
  useOpenInputDialog,
} from 'noya-designsystem';
import { DashboardIcon } from 'noya-icons';
import { getCurrentPlatform } from 'noya-keymap';
import { SketchFile } from 'noya-sketch-file';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Toolbar } from '../../components/Toolbar';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

const TitleContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    opacity: 0.8,
  },
  '&:active': {
    opacity: 0.9,
  },
});

function FileTitle({ id }: { id: string }) {
  const client = useNoyaClient();
  const files = useNoyaFiles();
  const cachedFile = files.find((file) => file.id === id);

  const openDialog = useOpenInputDialog();

  const updateName = useCallback(async () => {
    if (!cachedFile) return;

    const newName = await openDialog('Rename project', cachedFile.data.name);

    if (!newName) return;

    const data = { ...cachedFile.data, name: newName };

    client.files.update(cachedFile.id, data);
  }, [cachedFile, client.files, openDialog]);

  const theme = useDesignSystemTheme();

  if (!cachedFile) return null;

  return (
    <TitleContainer onClick={updateName}>
      <DashboardIcon color={theme.colors.textMuted} />
      <Spacer.Horizontal size={6} />
      <Small lineHeight={'15px'}>{cachedFile.data.name}</Small>
    </TitleContainer>
  );
}

function FileEditor({ id }: { id: string }) {
  const client = useNoyaClient();
  const files = useNoyaFiles();
  const cachedFile = files.find((file) => file.id === id);
  const fileName = cachedFile?.data.name;

  // The Ayon component is a controlled component that manages its own state
  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    // Load the latest version of this file from the server
    client.files.read(id).then(setInitialFile);
  }, [client, id]);

  const updateDesign = useCallback(
    (design: SketchFile) => {
      if (fileName === undefined) return;

      client.files.update(id, { name: fileName, design });
    },
    [client, fileName, id],
  );

  if (!initialFile) return null;

  return (
    <Ayon initialDesign={initialFile.data.design} onChange={updateDesign} />
  );
}

function Content() {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const theme = useDesignSystemTheme();

  if (!id) return null;

  return (
    <Stack.V flex="1" background={theme.colors.canvas.background}>
      <Toolbar>
        <FileTitle id={id} />
      </Toolbar>
      <Divider variant="strong" />
      <FileEditor id={id} />
    </Stack.V>
  );
}

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default function Project(): JSX.Element {
  return (
    <DesignSystemConfigurationProvider platform={platform} theme={lightTheme}>
      <Content />
    </DesignSystemConfigurationProvider>
  );
}
