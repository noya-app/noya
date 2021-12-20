import fetch from 'cross-fetch';
import { ApolloServer, gql } from 'apollo-server';
import fs from 'fs';
import 'mock-local-storage';
import { lightTheme } from 'noya-designsystem';
import { generateImage, ImageEncoding } from 'noya-generate-image';
import { LayerPreview, loadCanvasKit } from 'noya-renderer';
import { decode } from 'noya-sketch-file';
import { createInitialWorkspaceState, Layers, Selectors } from 'noya-state';
import {
  createBaseFileSystem,
  createTypescriptEnvironment,
} from 'noya-typescript';
import { setPathToWasm } from 'noya-utils';
import path from 'path';
import React from 'react';

const wasmPath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'packages',
  'app',
  'public',
  'wasm',
);

setPathToWasm(wasmPath);

const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

async function main() {
  const CanvasKit = await loadCanvasKit();

  const file = fs.readFileSync(path.join(__dirname, '..', 'Test.sketch'));

  const sketch = await decode(file);

  const workspaceState = createInitialWorkspaceState(sketch);
  const state = workspaceState.history.present;

  const typescriptEnvironment = createTypescriptEnvironment(
    await createBaseFileSystem(fetch),
  );

  const typeDefs = gql(schema);

  const resolvers = {
    Query: {
      colors: () => {
        const swatches = Selectors.getSharedSwatches(state);

        return swatches.map((swatch) => ({
          id: swatch.do_objectID,
          name: swatch.name,
          value: {
            r: swatch.value.red,
            g: swatch.value.green,
            b: swatch.value.blue,
            a: swatch.value.alpha,
          },
        }));
      },
      layers: (
        parent: unknown,
        args: { filter?: { name?: string; type?: string } } | undefined,
      ) => {
        const nameFilter = args?.filter?.name;
        const typeFilter = args?.filter?.type;

        const layers = state.sketch.pages.flatMap((page) =>
          Layers.findAll(
            page,
            (layer) =>
              (!nameFilter || layer.name.includes(nameFilter)) &&
              (!typeFilter || layer._class === typeFilter),
          ),
        );

        return layers.map((layer) => ({
          id: layer.do_objectID,
          name: layer.name,
          type: layer._class,
          async generatedCode(framework: 'reactDom' | 'reactNative') {
            if (!Layers.isComponentContainer(layer)) return '';

            return layer.component.source;
          },
          async renderedImage(args: {
            format: string;
            bufferEncoding: 'base64' | 'utf8';
          }) {
            const { format = 'png', bufferEncoding = 'base64' } = args;

            const size = {
              width: layer.frame.width,
              height: layer.frame.height,
            };

            const image = await generateImage(
              CanvasKit,
              typescriptEnvironment,
              size.width,
              size.height,
              lightTheme,
              workspaceState,
              format as ImageEncoding,
              () =>
                React.createElement(LayerPreview, {
                  layer: layer as any,
                  layerFrame: layer.frame,
                  previewSize: size,
                }),
            );

            return {
              size,
              format,
              data: image
                ? Buffer.from(image).toString(
                    format === 'svg' ? bufferEncoding : 'base64',
                  )
                : undefined,
            };
          },
        }));
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    if (process.send) {
      process.send('ready');
    } else {
      console.info(`🚀  Server ready at ${url}`);
    }
  });
}

main();
