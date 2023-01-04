import { act } from '@testing-library/react';
import type { CanvasKit as CanvasKitType } from 'canvaskit';
import fs from 'fs';
import { darkTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { FontManager } from 'noya-fonts';
import { generateImage } from 'noya-generate-image';
import { GoogleFontProvider } from 'noya-google-fonts';
import {
  DesignFile,
  loadCanvasKit,
  RenderingModeProvider,
} from 'noya-renderer';
import { decode } from 'noya-sketch-file';
import { PointString, SketchModel } from 'noya-sketch-model';
import {
  ApplicationReducerContext,
  createInitialWorkspaceState,
  createSketchFile,
  defaultBorderColor,
  Selectors,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import path from 'path';
import React from 'react';

let CanvasKit: CanvasKitType;
let context: ApplicationReducerContext;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
  const typefaceFontProvider = CanvasKit.TypefaceFontProvider.Make();
  context = {
    canvasInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    canvasSize: { width: 1000, height: 1000 },
    fontManager: {
      ...new FontManager(GoogleFontProvider),
      getTypefaceFontProvider: () => typefaceFontProvider,
    },
  };
});

function panToFit(
  workspaceState: WorkspaceState,
  pageIndex: number,
  padding = 0,
) {
  const page = workspaceState.history.present.sketch.pages[pageIndex];

  workspaceState = workspaceReducer(
    workspaceState,
    ['selectPage', page.do_objectID],
    CanvasKit,
    context.fontManager,
  );

  const boundingRect = Selectors.getPageContentBoundingRect(page);

  if (!boundingRect) {
    throw new Error('Failed to measure page');
  }

  const { scrollOrigin } = Selectors.getCurrentPageMetadata(
    workspaceState.history.present,
  );

  const delta = {
    x: boundingRect.x + scrollOrigin.x - padding,
    y: boundingRect.y + scrollOrigin.y - padding,
  };

  const canvasSize = {
    width: Math.round(boundingRect.width + padding * 2),
    height: Math.round(boundingRect.height + padding * 2),
  };

  workspaceState = workspaceReducer(
    workspaceState,
    ['setCanvasSize', canvasSize, { top: 0, right: 0, bottom: 0, left: 0 }],
    CanvasKit,
    context.fontManager,
  );

  workspaceState = workspaceReducer(
    workspaceState,
    ['pan*', delta],
    CanvasKit,
    context.fontManager,
  );

  return {
    size: canvasSize,
    workspaceState,
  };
}

async function generatePageImage(
  workspaceState: WorkspaceState,
  pageIndex: number,
  padding?: number,
) {
  const { size, workspaceState: updatedState } = panToFit(
    workspaceState,
    pageIndex,
    padding,
  );

  const image = await new Promise<Uint8Array | undefined>((resolve) => {
    act(() => {
      generateImage(
        CanvasKit,
        size.width,
        size.height,
        darkTheme,
        updatedState,
        'png',
        () => (
          <RenderingModeProvider value="interactive">
            <DesignFile />
          </RenderingModeProvider>
        ),
      ).then(resolve);
    });
  });

  if (!image) {
    throw new Error('Failed to render image');
  }

  return image;
}

async function getSketchFile(filename: string) {
  const file = await fs.promises.readFile(
    path.join(__dirname, '../../public', filename),
  );

  return await decode(file);
}

async function generateSketchFileImage(
  filename: string,
  pageIndex: number,
  padding?: number,
) {
  const sketch = await getSketchFile(filename);
  const workspaceState = createInitialWorkspaceState(sketch);
  return await generatePageImage(workspaceState, pageIndex, padding);
}

test('Demo', async () => {
  const image = await generateSketchFileImage('Demo.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('AlphaMasks', async () => {
  const image = await generateSketchFileImage('AlphaMasks.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('BackdropFilter', async () => {
  const image = await generateSketchFileImage('BackdropFilter.sketch', 0, 20);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('BooleanOperations', async () => {
  const image = await generateSketchFileImage('BooleanOperations.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('BooleanOperationsAdvanced', async () => {
  const image = await generateSketchFileImage(
    'BooleanOperationsAdvanced.sketch',
    0,
  );
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Image', async () => {
  const image = await generateSketchFileImage('Image.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('ImageFills', async () => {
  const image = await generateSketchFileImage('ImageFills.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('InnerShadows', async () => {
  const image = await generateSketchFileImage('InnerShadows.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Gradient', async () => {
  const image = await generateSketchFileImage('Gradient.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

const red = SketchModel.color({ red: 1, green: 0, blue: 0, alpha: 1 });
const green = SketchModel.color({ red: 0, green: 1, blue: 0, alpha: 1 });
const blue = SketchModel.color({ red: 0, green: 0, blue: 1, alpha: 1 });

const gradientStops = [
  SketchModel.gradientStop({ position: 0, color: red }),
  SketchModel.gradientStop({ position: 0.5, color: green }),
  SketchModel.gradientStop({ position: 1, color: blue }),
];

describe('gradient editor', () => {
  test('linear gradient', async () => {
    const rectangle = SketchModel.rectangle({
      frame: SketchModel.rect({ x: 100, y: 100, width: 200, height: 200 }),
      style: SketchModel.style({
        fills: [
          SketchModel.fill({
            fillType: Sketch.FillType.Gradient,
            gradient: SketchModel.gradient({ stops: gradientStops }),
          }),
        ],
      }),
    });

    const workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    workspaceState.history.present.selectedGradient = {
      layerId: rectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 1,
      styleType: 'fills',
    };

    const image = await generatePageImage(workspaceState, 0, 10);
    expect(Buffer.from(image)).toMatchImageSnapshot();
  });

  test('radial gradient', async () => {
    const rectangle = SketchModel.rectangle({
      frame: SketchModel.rect({ x: 100, y: 100, width: 200, height: 200 }),
      style: SketchModel.style({
        fills: [
          SketchModel.fill({
            fillType: Sketch.FillType.Gradient,
            gradient: SketchModel.gradient({
              gradientType: Sketch.GradientType.Radial,
              stops: gradientStops,
            }),
          }),
        ],
      }),
    });

    const workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    workspaceState.history.present.selectedGradient = {
      layerId: rectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 1,
      styleType: 'fills',
    };

    const image = await generatePageImage(workspaceState, 0, 200);
    expect(Buffer.from(image)).toMatchImageSnapshot();
  });
});

describe('line editor', () => {
  test('selected line in artboard', async () => {
    const line = SketchModel.shapePath({
      points: [
        SketchModel.curvePoint({
          point: PointString.encode({ x: 1, y: 1 }),
        }),
        SketchModel.curvePoint({
          point: PointString.encode({ x: 0, y: 0 }),
        }),
      ],
      frame: SketchModel.rect({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      }),
      style: SketchModel.style({
        borders: [
          SketchModel.border({
            color: defaultBorderColor,
          }),
        ],
      }),
    });

    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      }),
      layers: [line],
    });

    const workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );
    workspaceState.history.present.selectedLayerIds = [line.do_objectID];

    const image = await generatePageImage(workspaceState, 0);

    expect(Buffer.from(image)).toMatchImageSnapshot();
  });
});

test('Rotation 0', async () => {
  const image = await generateSketchFileImage('Rotation.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Rotation 1', async () => {
  const image = await generateSketchFileImage('Rotation.sketch', 1);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Rotation 2', async () => {
  const image = await generateSketchFileImage('Rotation.sketch', 2);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Rotation 3', async () => {
  const image = await generateSketchFileImage('Rotation.sketch', 3);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Rotation 4', async () => {
  const image = await generateSketchFileImage('Rotation.sketch', 4);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Masks', async () => {
  const image = await generateSketchFileImage('Masks.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('SamplePath 0', async () => {
  const image = await generateSketchFileImage('SamplePath.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('SamplePath 1', async () => {
  const image = await generateSketchFileImage('SamplePath.sketch', 1);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('SamplePath 2', async () => {
  const image = await generateSketchFileImage('SamplePath.sketch', 2);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('SamplePath 3', async () => {
  const image = await generateSketchFileImage('SamplePath.sketch', 3);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('SamplePath 4', async () => {
  const image = await generateSketchFileImage('SamplePath.sketch', 4);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('SamplePath 5', async () => {
  const image = await generateSketchFileImage('SamplePath.sketch', 5);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Shaders', async () => {
  const image = await generateSketchFileImage('Shaders.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Shadows', async () => {
  const image = await generateSketchFileImage('Shadows.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Symbols', async () => {
  const image = await generateSketchFileImage('Symbols.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Symbols 2', async () => {
  const image = await generateSketchFileImage('Symbols.sketch', 2);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('TextLayers', async () => {
  const image = await generateSketchFileImage('TextLayers.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Tints', async () => {
  const image = await generateSketchFileImage('Tints.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('WindingRule', async () => {
  const image = await generateSketchFileImage('WindingRule.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});
