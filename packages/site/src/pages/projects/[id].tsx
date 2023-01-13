import produce from 'immer';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, useNoyaClient } from 'noya-api';
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

function Content() {
  const {
    query: { id },
  } = useRouter();
  const client = useNoyaClient();

  const [file, setFile] = useState<NoyaAPI.File | undefined>();

  // The Ayon component is a controlled component that manages its own state
  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    if (typeof id !== 'string') return;

    client.files.read(id).then((file) => {
      setInitialFile(file);
      setFile(file);
    });
  }, [client, id]);

  const updateDesign = useCallback((design: SketchFile) => {
    setFile((file) => {
      if (!file) return undefined;

      return produce(file, (draft) => {
        draft.data.design = design;
      });
    });
  }, []);

  const openDialog = useOpenInputDialog();

  const updateName = useCallback(async () => {
    if (!file) return;

    const newName = await openDialog('Rename project', file.data.name);

    if (!newName) return;

    const data = { ...file.data, name: newName };

    client.files.update(file.id, data);

    setFile({ ...file, data });
  }, [client, file, openDialog]);

  const theme = useDesignSystemTheme();

  return (
    <Stack.V flex="1" background={theme.colors.canvas.background}>
      <Toolbar>
        {file && (
          <TitleContainer onClick={updateName}>
            <DashboardIcon color={theme.colors.textMuted} />
            <Spacer.Horizontal size={6} />
            <Small lineHeight={'15px'}>{file.data.name}</Small>
          </TitleContainer>
        )}
      </Toolbar>
      <Divider variant="strong" />
      {initialFile && (
        <Ayon initialDesign={initialFile.data.design} onChange={updateDesign} />
      )}
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
