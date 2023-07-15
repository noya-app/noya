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
import { Layers, Overrides, createSketchFile } from 'noya-state';
import React, { CSSProperties, useEffect, useState } from 'react';
import { PreferredOverride, blockMetadata } from '../ayon/symbols/metadata';
import { ViewType } from '../ayon/types';
import { useAyon } from '../components/AyonContext';

function Content({
  symbolId,
  viewType = 'combined',
}: {
  symbolId: string;
  viewType?: ViewType;
}) {
  const Ayon = useAyon();

  const client = useNoyaClient();

  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    client.files.read(symbolId).then(setInitialFile);
  }, [client, symbolId]);

  if (!initialFile) return null;

  return (
    <Ayon
      fileId={symbolId}
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
  master: Sketch.SymbolMaster;
  size: Size;
  blockText?: string;
  blockParameters?: string[];
  resolvedBlockData?: Sketch.ResolvedBlockData;
  overrideValues?: Sketch.OverrideValue[];
};

export function createBlockExample({
  symbolId,
  width,
  height,
  blockText,
  blockParameters,
  resolvedBlockText,
  preferredOverrides,
  overrideValues,
  getSymbolMaster,
}: {
  symbolId: string;
  width: number;
  height: number;
  blockText?: string;
  blockParameters?: string[];
  resolvedBlockText?: string;
  preferredOverrides?: PreferredOverride[];
  overrideValues?: Sketch.OverrideValue[];
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster;
}): BlockExample {
  const originalText =
    blockText ??
    getSymbolMaster(symbolId).blockDefinition?.placeholderText ??
    '';

  const resolvedBlockData: Sketch.ResolvedBlockData | undefined =
    resolvedBlockText
      ? {
          originalText,
          resolvedText: resolvedBlockText,
          symbolID: symbolId,
          resolvedAt: new Date().toISOString(),
        }
      : undefined;

  const layers = getSymbolMaster(symbolId).layers;

  const overrides: Sketch.OverrideValue[] =
    overrideValues ??
    (preferredOverrides ?? []).flatMap((override) => {
      const content =
        override.blockText ??
        getSymbolMaster(symbolId).blockDefinition?.placeholderText ??
        '';

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
    master: getSymbolMaster(symbolId),
    size: { width, height },
    blockText,
    blockParameters,
    resolvedBlockData,
    overrideValues: overrides,
  };
}

function Loader({
  symbolId,
  width,
  height,
  viewType,
  blockText,
  blockParameters,
  resolvedBlockText,
  preferredOverrides,
  overrideValues,
  getSymbolMaster,
}: {
  symbolId: string;
  width: number;
  height: number;
  viewType?: ViewType;
  blockText?: string;
  blockParameters?: string[];
  resolvedBlockText?: string;
  preferredOverrides?: PreferredOverride[];
  overrideValues?: Sketch.OverrideValue[];
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster;
}) {
  const [client, setClient] = useState<NoyaAPI.Client | undefined>();

  useEffect(() => {
    const client = new NoyaAPI.Client({
      networkClient: new NoyaAPI.MemoryClient({
        files: [
          createLocalFile(
            createBlockExample({
              symbolId,
              width,
              height,
              blockText,
              blockParameters,
              resolvedBlockText,
              preferredOverrides,
              overrideValues,
              getSymbolMaster,
            }),
          ),
        ],
      }),
    });

    setClient(client);
  }, [
    symbolId,
    blockParameters,
    blockText,
    height,
    overrideValues,
    preferredOverrides,
    resolvedBlockText,
    width,
    getSymbolMaster,
  ]);

  if (!symbolId || !client) return null;

  return (
    <NoyaAPIProvider value={client}>
      <Content symbolId={symbolId} viewType={viewType} />
    </NoyaAPIProvider>
  );
}

export interface BlockPreviewProps {
  symbolId: string;
  name?: string;
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
export function InteractiveBlockPreview(
  props: BlockPreviewProps & {
    getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster;
  },
) {
  // console.log('InteractiveBlockPreview', props.getSymbolMaster(props.symbolId));

  // return null;

  const config = useDesignSystemConfiguration();

  const blockWidth =
    props.blockWidth ??
    blockMetadata[props.symbolId]?.preferredSize.width ??
    600;
  const blockHeight =
    props.blockHeight ??
    blockMetadata[props.symbolId]?.preferredSize.height ??
    400;
  const width = props.width ?? '100%';
  const height = props.height ? props.height : blockHeight + 40;
  const blockText =
    props.blockText ?? blockMetadata[props.symbolId]?.preferredBlockText;
  const resolvedBlockText =
    props.resolvedBlockText ??
    blockMetadata[props.symbolId]?.preferredResolvedBlockText;
  const preferredOverrides =
    props.preferredOverrides ??
    blockMetadata[props.symbolId]?.preferredOverrides;

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
  master,
  size,
  blockText,
  blockParameters,
  resolvedBlockData,
  overrideValues,
}: BlockExample) {
  const instance = SketchModel.symbolInstance({
    symbolID: master.symbolID,
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
    id: master.symbolID,
    version: 0,
    data: {
      name: master.name,
      schemaVersion: '0.1.0',
      document,
      type: 'io.noya.ayon',
    },
  };

  return file;
}
