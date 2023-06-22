import dynamic from 'next/dynamic';
import { NoyaAPI, NoyaAPIProvider, useNoyaClient } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  Stack,
  lightTheme,
  useDesignSystemConfiguration,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { Size } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import {
  BlockDefinition,
  Layers,
  Overrides,
  createSketchFile,
} from 'noya-state';
import React, { CSSProperties, useEffect, useState } from 'react';
import { PreferredOverride, blockMetadata } from '../ayon/blocks/blockMetadata';
import { Blocks } from '../ayon/blocks/blocks';
import { parseBlock } from '../ayon/parse';
import { ViewType } from '../ayon/types';

const Ayon = dynamic(() => import('../components/Ayon'), { ssr: false });

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

export type BlockExample = {
  block: BlockDefinition;
  size: Size;
  blockText?: string;
  resolvedBlockData?: Sketch.ResolvedBlockData;
  overrideValues?: Sketch.OverrideValue[];
};

export function createBlockExample({
  blockId,
  width,
  height,
  blockText,
  resolvedBlockText,
  overrides,
}: {
  blockId: string;
  width: number;
  height: number;
  blockText?: string;
  resolvedBlockText?: string;
  overrides?: PreferredOverride[];
}) {
  const { content: originalText } = parseBlock(
    blockText,
    Blocks[blockId].parser,
    { placeholder: Blocks[blockId].placeholderText },
  );

  const resolvedBlockData: Sketch.ResolvedBlockData | undefined =
    resolvedBlockText
      ? {
          originalText,
          resolvedText: resolvedBlockText,
          symbolID: blockId,
          resolvedAt: new Date().toISOString(),
        }
      : undefined;

  const layers = Blocks[blockId].symbol.layers;

  const overrideValues: Sketch.OverrideValue[] = (overrides ?? []).flatMap(
    (override) => {
      const { content } = parseBlock(
        override.blockText,
        Blocks[override.symbolId].parser,
        { placeholder: Blocks[override.symbolId].placeholderText },
      );

      const layer = layers.find(
        (layer): layer is Sketch.SymbolInstance =>
          Layers.isSymbolInstance(layer) &&
          layer.symbolID === override.symbolId,
      );

      if (!layer) return [];

      return [
        SketchModel.overrideValue({
          overrideName: Overrides.encodeName([layer.do_objectID], 'blockText'),
          value: override.blockText,
        }),
        ...(override.resolvedBlockText
          ? [
              SketchModel.overrideValue({
                overrideName: Overrides.encodeName(
                  [layer.do_objectID],
                  'resolvedBlockData',
                ),
                value: {
                  symbolID: layer.symbolID,
                  originalText: content,
                  resolvedText: override.resolvedBlockText,
                },
              }),
            ]
          : []),
      ];
    },
  );

  return {
    block: Blocks[blockId],
    size: { width, height },
    blockText,
    resolvedBlockData,
    overrideValues,
  };
}

function Loader({
  blockId,
  width,
  height,
  viewType,
  blockText,
  resolvedBlockText,
  overrides,
}: {
  blockId: string;
  width: number;
  height: number;
  viewType?: ViewType;
  blockText?: string;
  resolvedBlockText?: string;
  overrides?: PreferredOverride[];
}) {
  const [client, setClient] = useState<NoyaAPI.Client | undefined>();

  useEffect(() => {
    const client = new NoyaAPI.Client({
      networkClient: new NoyaAPI.MemoryClient({
        files: [
          createLocalFile(
            createBlockExample({
              blockId,
              width,
              height,
              blockText,
              resolvedBlockText,
              overrides,
            }),
          ),
        ],
      }),
    });

    setClient(client);
  }, [blockId, blockText, height, overrides, resolvedBlockText, width]);

  if (!blockId || !client) return null;

  return (
    <NoyaAPIProvider value={client}>
      <Content blocks={Blocks} blockId={blockId} viewType={viewType} />
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
  resolvedBlockText?: string;
  overrides?: PreferredOverride[];
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
  const blockText =
    props.blockText ?? blockMetadata[props.blockId]?.preferredBlockText;
  const resolvedBlockText =
    props.resolvedBlockText ??
    blockMetadata[props.blockId]?.preferredResolvedBlockText;
  const overrides =
    props.overrides ?? blockMetadata[props.blockId]?.preferredOverrides;

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
        <Loader
          {...props}
          width={blockWidth}
          height={blockHeight}
          blockText={blockText}
          resolvedBlockText={resolvedBlockText}
          overrides={overrides}
        />
      </Stack.V>
    </DesignSystemConfigurationProvider>
  );
}

function createLocalFile({
  block,
  size,
  blockText,
  resolvedBlockData,
  overrideValues,
}: BlockExample) {
  const instance = SketchModel.symbolInstance({
    symbolID: block.symbol.symbolID,
    frame: SketchModel.rect({
      width: size.width,
      height: size.height,
    }),
    blockText,
    resolvedBlockData,
    overrideValues,
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
