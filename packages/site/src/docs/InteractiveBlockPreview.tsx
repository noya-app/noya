import { ChakraProvider } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { NoyaAPI, NoyaAPIProvider, useNoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
  Stack,
  useDesignSystemConfiguration,
} from 'noya-designsystem';
import { Size } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import { BlockDefinition, createSketchFile } from 'noya-state';
import React, { CSSProperties, useEffect, useState } from 'react';
import { blockMetadata } from '../ayon/blocks/blockMetadata';
import { ViewType } from '../ayon/Content';

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
  viewType = 'combined',
}: {
  blocks: Record<string, BlockDefinition>;
  blockId: string;
  viewType?: ViewType;
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
      viewType={viewType}
      isPlayground
    />
  );
}

function Loader({
  blockId,
  width,
  height,
  viewType,
  blockText,
}: {
  blockId: string;
  width: number;
  height: number;
  viewType?: ViewType;
  blockText?: string;
}) {
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
          files: [
            createLocalFile({
              block: blocks[blockId],
              size: { width, height },
              blockText,
            }),
          ],
        }),
      });

      setClient(client);
    });
  }, [blockId, blockText, height, width]);

  if (!blocks || !blockId || !client) return null;

  return (
    <NoyaAPIProvider value={client}>
      <Content blocks={blocks} blockId={blockId} viewType={viewType} />
    </NoyaAPIProvider>
  );
}

interface Props {
  blockId: string;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  blockHeight?: number;
  blockWidth?: number;
  viewType?: ViewType;
  blockText?: string;
}

// We load a placeholder UI as soon as possible. Then wait for Ayon/Blocks to load.
// We load Ayon/Blocks async to work around a react-jsx transform issue when loading Chakra.
export function InteractiveBlockPreview(props: Props) {
  const config = useDesignSystemConfiguration();

  const blockWidth =
    props.blockWidth ??
    blockMetadata[props.blockId]?.preferredSize.width ??
    600;
  const blockHeight =
    props.blockHeight ??
    blockMetadata[props.blockId]?.preferredSize.height ??
    400;

  const width = props.width ?? '100%';
  const height = props.height ? props.height : blockHeight + 40;

  return (
    <DesignSystemConfigurationProvider
      platform={config.platform}
      theme={lightTheme}
    >
      <Stack.V
        height={height}
        width={width}
        background={lightTheme.colors.canvas.background}
      >
        <Loader {...props} width={blockWidth} height={blockHeight} />
      </Stack.V>
    </DesignSystemConfigurationProvider>
  );
}

function createLocalFile({
  block,
  size,
  blockText,
}: {
  block: BlockDefinition;
  size: Size;
  blockText?: string;
}) {
  const instance = SketchModel.symbolInstance({
    symbolID: block.symbol.symbolID,
    frame: SketchModel.rect({
      width: size.width,
      height: size.height,
    }),
    blockText,
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
