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
} from 'noya-designsystem';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Toolbar } from '../../components/Toolbar';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

const Chip = styled.span(({ theme }) => ({
  ...theme.textStyles.label,
  padding: '4px',
  color: theme.colors.secondary,
  background: 'rgb(205, 238, 231)',
  borderRadius: 4,
  userSelect: 'none',
}));

function Content({ id }: { id: string }) {
  const theme = useDesignSystemTheme();
  const client = useNoyaClient();

  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    client.files.shares.read(id).then(setInitialFile);
  }, [client, id]);

  if (!initialFile) return null;

  return (
    <Stack.V flex="1" background={theme.colors.canvas.background}>
      <Toolbar>
        <Small>
          {initialFile.data.name}
          <Spacer.Horizontal size={8} inline />
          <Chip>VIEWING</Chip>
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

export default function Preview() {
  const { query } = useRouter();
  const id = query.id as string | undefined;

  if (!id) return null;

  return (
    <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
      <Content id={id} />
    </DesignSystemConfigurationProvider>
  );
}
