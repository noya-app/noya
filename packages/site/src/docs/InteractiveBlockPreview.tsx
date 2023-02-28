import { ChakraProvider } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { NoyaAPI, NoyaAPIProvider, useNoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
  Stack,
} from 'noya-designsystem';
import { Size } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import { BlockDefinition, createSketchFile } from 'noya-state';
import React, { useEffect, useState } from 'react';

const Blocks = import('../ayon/blocks/blocks');
const Ayon = dynamic(() => import('../components/Ayon'), { ssr: false });

export function BlockPreview({
  symbolId,
  blockText,
  width,
  height,
  getBlock,
}: {
  symbolId: string;
  blockText: string;
  width: number;
  height: number;
  getBlock: (symbolId: string) => BlockDefinition;
}) {
  const layer = SketchModel.symbolInstance({
    symbolID: symbolId,
    blockText,
    frame: SketchModel.rect({
      width,
      height,
    }),
  });

  const rendered = getBlock(symbolId).render({
    layer,
    symbolId,
    frame: layer.frame,
    blockText: layer.blockText,
    resolvedBlockData: layer.resolvedBlockData,
    getBlock,
  });

  return <ChakraProvider>{rendered}</ChakraProvider>;
}

function Content({
  blocks,
  blockId,
}: {
  blocks: Record<string, BlockDefinition>;
  blockId: string;
}) {
  const block = blocks[blockId];

  const client = useNoyaClient();

  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    client.files.read(blockId).then(setInitialFile);
  }, [client, blockId]);

  if (!initialFile) return null;

  return (
    <Ayon
      fileId={block.symbol.do_objectID}
      canvasRendererType="svg"
      initialDocument={initialFile.data.document}
      name={initialFile.data.name}
      uploadAsset={async () => ''}
      viewType="combined"
      isPlayground
    />
  );
}

function Loader({ blockId, width, height }: Props) {
  const [blocks, setBlocks] = useState<
    Record<string, BlockDefinition> | undefined
  >();
  const [client, setClient] = useState<NoyaAPI.Client | undefined>();

  useEffect(() => {
    if (!blockId) return;

    Blocks.then((m) => {
      const blocks = m.Blocks;

      setBlocks(blocks);

      const client = new NoyaAPI.Client({
        networkClient: new NoyaAPI.MemoryClient({
          files: [createLocalFile(blocks[blockId], { width, height })],
        }),
      });

      setClient(client);
    });
  }, [blockId, height, width]);

  if (!blocks || !blockId || !client) return null;

  return (
    <NoyaAPIProvider value={client}>
      <Content blocks={blocks} blockId={blockId} />
    </NoyaAPIProvider>
  );
}

interface Props {
  blockId: string;
  width: number;
  height: number;
}

// We load a placeholder UI as soon as possible. Then wait for Ayon/Blocks to load.
// We load Ayon/Blocks async to work around a react-jsx transform issue when loading Chakra.
export function InteractiveBlockPreview(props: Props) {
  return (
    <DesignSystemConfigurationProvider platform="key" theme={lightTheme}>
      <Stack.V
        height={props.height + 40}
        maxWidth="100%"
        background={lightTheme.colors.canvas.background}
      >
        <Loader {...props} />
      </Stack.V>
    </DesignSystemConfigurationProvider>
  );
}

function createLocalFile(block: BlockDefinition, size: Size) {
  const instance = SketchModel.symbolInstance({
    symbolID: block.symbol.symbolID,
    frame: SketchModel.rect({
      width: size.width,
      height: size.height,
    }),
  });

  const artboard = SketchModel.artboard({
    name: 'Wireframe',
    frame: SketchModel.rect({
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    }),
    layers: [instance],
  });

  const document = createSketchFile(SketchModel.page({ layers: [artboard] }));

  const file: NoyaAPI.File = {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: block.symbol.symbolID,
    version: 0,
    data: {
      name: block.symbol.name,
      schemaVersion: '0.1.0',
      document,
      type: 'io.noya.ayon',
    },
  };

  return file;
}
