import {
  Button,
  DesignSystemConfigurationProvider,
  Divider,
  Stack,
  lightTheme,
  useDesignSystemConfiguration,
} from '@noya-app/noya-designsystem';
import { SketchModel } from '@noya-app/noya-sketch-model';
import { groupBy, uuid } from '@noya-app/noya-utils';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider, useNoyaClient } from 'noya-api';
import { createSketchFile } from 'noya-state';
import React, { useEffect, useMemo, useState } from 'react';
import { BlockMetadata } from '../ayon/symbols/metadata';
import { librarySymbolMap } from '../ayon/symbols/symbols';
import { ViewType } from '../ayon/types';
import { Ayon } from '../components/Ayon';
import { Toolbar } from '../components/Toolbar';
import { BlockExample, createBlockExample } from './InteractiveBlockPreview';

function Content({
  fileId,
  viewType = 'editable',
}: {
  fileId: string;
  viewType?: ViewType;
}) {
  const client = useNoyaClient();

  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    client.files.read(fileId).then(setInitialFile);
  }, [client, fileId]);

  if (!initialFile || initialFile.data.type !== 'io.noya.ayon') return null;

  return (
    <Ayon
      fileId={fileId}
      canvasRendererType="svg"
      initialDocument={initialFile.data.document}
      name={initialFile.data.name}
      uploadAsset={async () => ''}
      viewType={viewType}
      padding={20}
    />
  );
}

function Loader({ initialFile }: { initialFile: NoyaAPI.File }) {
  const client = useMemo(() => {
    return new NoyaAPI.Client({
      networkClient: new NoyaAPI.MemoryClient({
        files: [initialFile],
      }),
    });
  }, [initialFile]);

  return (
    <NoyaAPIProvider value={client}>
      <Content fileId={initialFile.id} />
    </NoyaAPIProvider>
  );
}

interface Props {
  designSystemId: string;
  blockInstances: [string, BlockMetadata][];
}

export function DesignSystemExplorer({
  blockInstances,
  designSystemId,
}: Props) {
  const config = useDesignSystemConfiguration();
  const client = useNoyaClient();
  const router = useRouter();
  const getSymbolMaster = (symbolId: string) => librarySymbolMap[symbolId];

  const file = useMemo(() => {
    const examples = blockInstances.map(([symbolId, blockMetadata]) => {
      const width = blockMetadata?.preferredSize.width ?? 600;
      const height = blockMetadata?.preferredSize.height ?? 400;
      const blockText = blockMetadata?.preferredBlockText;
      const resolvedBlockText = blockMetadata?.preferredResolvedBlockText;
      const preferredOverrides = blockMetadata?.preferredOverrides;

      return createBlockExample({
        getSymbolMaster,
        symbolId,
        width,
        height,
        blockText,
        resolvedBlockText,
        preferredOverrides,
      });
    });

    return createLocalFile({ examples, designSystemId });
  }, [blockInstances, designSystemId]);

  return (
    <DesignSystemConfigurationProvider
      platform={config.platform}
      theme={lightTheme}
    >
      <Stack.V flex="1" background={lightTheme.colors.canvas.background}>
        <Toolbar>
          <Button
            onClick={async () => {
              const newFile = await client.files.create(file);

              router.push(`/projects/${newFile.id}`);
            }}
          >
            Clone to Projects
          </Button>
        </Toolbar>
        <Divider />
        <Stack.V flex="1">
          <Loader initialFile={file} />
        </Stack.V>
      </Stack.V>
    </DesignSystemConfigurationProvider>
  );
}

function createLocalFile({
  examples,
  designSystemId,
}: {
  examples: BlockExample[];
  designSystemId: string;
}) {
  const padding = 40;
  let y = padding;

  const groups = groupBy(examples, (example) => example.master.symbolID);

  const instances = Object.values(groups).flatMap((examples) => {
    let x = padding;

    const group = examples.map((example) => {
      const instance = SketchModel.symbolInstance({
        symbolID: example.master.symbolID,
        frame: SketchModel.rect({
          x,
          y,
          width: example.size.width,
          height: example.size.height,
        }),
        blockText: example.blockText,
        resolvedBlockData: example.resolvedBlockData,
        overrideValues: example.overrideValues,
      });

      x += example.size.width + padding;

      return instance;
    });

    const groupHeight = Math.max(...examples.map((e) => e.size.height));

    y += groupHeight + padding;

    return group;
  });

  const artboard = SketchModel.artboard({
    name: 'Wireframe',
    frame: SketchModel.rect({
      x: 0,
      y: 0,
      width: padding * 2 + Math.max(...examples.map((e) => e.size.width)),
      height: y,
    }),
    layers: instances,
  });

  const document = createSketchFile(SketchModel.page({ layers: [artboard] }));

  document.document.designSystem = {
    id: designSystemId,
    type: 'standard',
  };

  const file: NoyaAPI.File = {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: uuid(),
    version: 0,
    data: {
      name: 'Design System Explorer',
      schemaVersion: '0.1.0',
      document,
      type: 'io.noya.ayon',
    },
  };

  return file;
}
