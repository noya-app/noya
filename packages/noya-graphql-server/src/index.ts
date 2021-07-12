import { ApolloServer, gql } from 'apollo-server';
import fs from 'fs';
import { decode } from 'noya-sketch-file';
import { createInitialWorkspaceState, Layers, Selectors } from 'noya-state';
import path from 'path';
import { LayerPreview, loadCanvasKit } from 'noya-renderer';
import { setPathToWasm } from 'noya-utils';
import { ImageEncoding, generateImage } from 'noya-generate-image';
import { lightTheme } from 'noya-designsystem';
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

async function main() {
  const CanvasKit = await loadCanvasKit();

  const file = fs.readFileSync(path.join(__dirname, '..', 'Test.sketch'));

  const sketch = await decode(file);

  const workspaceState = createInitialWorkspaceState(sketch);
  const state = workspaceState.history.present;

  const typeDefs = gql`
    type ColorValue {
      r: Float!
      g: Float!
      b: Float!
      a: Float!
    }

    type Color {
      id: ID!
      name: String!
      value: ColorValue!
    }

    enum LayerType {
      artboard
      bitmap
      group
      oval
      page
      polygon
      rectangle
      shapeGroup
      shapePath
      slice
      star
      symbolInstance
      symbolMaster
      text
      triangle
    }

    type Size {
      width: Float!
      height: Float!
    }

    enum BufferEncoding {
      base64
      utf8
    }

    enum RenderedImageFormat {
      png
      jpg
      webp
      svg
    }

    type RenderedImage {
      size: Size!
      format: RenderedImageFormat!
      data: String!
    }

    type Layer {
      id: ID!
      name: String!
      type: LayerType!
      renderedImage(
        format: RenderedImageFormat
        bufferEncoding: BufferEncoding
      ): RenderedImage
    }

    input LayersFilter {
      name: String
      type: LayerType
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each.
    type Query {
      colors: [Color]
      layers(filter: LayersFilter): [Layer]
    }
  `;

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
              size.width,
              size.height,
              lightTheme,
              workspaceState,
              format as ImageEncoding,
              () =>
                React.createElement(LayerPreview, {
                  layer: layer as any,
                  size,
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
    console.info(`🚀  Server ready at ${url}`);
  });
}

main();
