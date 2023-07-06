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
import { useAyon } from '../components/AyonContext';

function Content({
  blocks,
  blockId,
  viewType = 'combined',
}: {
  blocks: Record<string, BlockDefinition>;
  blockId: string;
  viewType?: ViewType;
}) {
  const Ayon = useAyon();

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
  blockParameters?: string[];
  resolvedBlockData?: Sketch.ResolvedBlockData;
  overrideValues?: Sketch.OverrideValue[];
};

export function createBlockExample({
  blockId,
  width,
  height,
  blockText,
  blockParameters,
  resolvedBlockText,
  preferredOverrides,
  overrideValues,
}: {
  blockId: string;
  width: number;
  height: number;
  blockText?: string;
  blockParameters?: string[];
  resolvedBlockText?: string;
  preferredOverrides?: PreferredOverride[];
  overrideValues?: Sketch.OverrideValue[];
}): BlockExample {
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

  const overrides: Sketch.OverrideValue[] =
    overrideValues ??
    (preferredOverrides ?? []).flatMap((override) => {
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
    });

  return {
    block: Blocks[blockId],
    size: { width, height },
    blockText,
    blockParameters,
    resolvedBlockData,
    overrideValues: overrides,
  };
}

function Loader({
  blockId,
  width,
  height,
  viewType,
  blockText,
  blockParameters,
  resolvedBlockText,
  preferredOverrides,
  overrideValues,
}: {
  blockId: string;
  width: number;
  height: number;
  viewType?: ViewType;
  blockText?: string;
  blockParameters?: string[];
  resolvedBlockText?: string;
  preferredOverrides?: PreferredOverride[];
  overrideValues?: Sketch.OverrideValue[];
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
              blockParameters,
              resolvedBlockText,
              preferredOverrides,
              overrideValues: overrideValues,
            }),
          ),
        ],
      }),
    });

    setClient(client);
  }, [
    blockId,
    blockParameters,
    blockText,
    height,
    overrideValues,
    preferredOverrides,
    resolvedBlockText,
    width,
  ]);

  if (!blockId || !client) return null;

  return (
    <NoyaAPIProvider value={client}>
      <Content blocks={Blocks} blockId={blockId} viewType={viewType} />
    </NoyaAPIProvider>
  );
}

export interface BlockPreviewProps {
  blockId: string;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  blockHeight?: number;
  blockWidth?: number;
  viewType?: ViewType;
  blockText?: string;
  blockParameters?: string[];
  resolvedBlockText?: string;
  preferredOverrides?: PreferredOverride[];
  overrideValues?: Sketch.OverrideValue[];
}

// We load a placeholder UI as soon as possible. Then wait for Ayon/Blocks to load.
// We load Ayon/Blocks async to work around a react-jsx transform issue when loading Chakra.
export function InteractiveBlockPreview(props: BlockPreviewProps) {
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
  const preferredOverrides =
    props.preferredOverrides ??
    blockMetadata[props.blockId]?.preferredOverrides;

  return (
    <DesignSystemConfigurationProvider
      platform={config.platform}
      theme={lightTheme}
    >
      <Stack.V
        id="InteractiveBlockPreview"
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
          preferredOverrides={preferredOverrides}
          overrideValues={props.overrideValues}
        />
      </Stack.V>
    </DesignSystemConfigurationProvider>
  );
}

function createLocalFile({
  block,
  size,
  blockText,
  blockParameters,
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
    blockParameters,
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
