import { act } from '@testing-library/react';
import type { CanvasKit as CanvasKitType } from 'canvaskit';
import fs from 'fs';
import { darkTheme } from 'noya-designsystem';
import { FontManager } from 'noya-fonts';
import { generateImage } from 'noya-generate-image';
import { GoogleFontProvider } from 'noya-google-fonts';
import {
  loadCanvasKit,
  RenderingModeProvider,
  SketchFileRenderer,
} from 'noya-renderer';
import { decode } from 'noya-sketch-file';
import {
  ApplicationReducerContext,
  createInitialWorkspaceState,
  Selectors,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import path from 'path';

let CanvasKit: CanvasKitType;
let context: ApplicationReducerContext;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
  const typefaceFontProvider = CanvasKit.TypefaceFontProvider.Make();
  context = {
    canvasSize: { width: 1000, height: 1000 },
    fontManager: {
      ...new FontManager(GoogleFontProvider),
      getTypefaceFontProvider: () => typefaceFontProvider,
    },
  };
});

function panToFit(workspaceState: WorkspaceState, pageIndex: number) {
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
    x: boundingRect.x + scrollOrigin.x,
    y: boundingRect.y + scrollOrigin.y,
  };

  return {
    size: {
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height),
    },
    workspaceState: workspaceReducer(
      workspaceState,
      ['pan', delta],
      CanvasKit,
      context.fontManager,
    ),
  };
}

async function generatePageImage(
  workspaceState: WorkspaceState,
  pageIndex: number,
) {
  const { size, workspaceState: updatedState } = panToFit(
    workspaceState,
    pageIndex,
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
            <SketchFileRenderer />
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

async function generateSketchFileImage(filename: string, pageIndex: number) {
  const sketch = await getSketchFile(filename);
  const workspaceState = createInitialWorkspaceState(sketch);
  return await generatePageImage(workspaceState, pageIndex);
}

test('Demo', async () => {
  const image = await generateSketchFileImage('Demo.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('AlphaMasks', async () => {
  const image = await generateSketchFileImage('AlphaMasks.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('BooleanOperations', async () => {
  const image = await generateSketchFileImage('BooleanOperations.sketch', 0);
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

test('Gradient', async () => {
  const image = await generateSketchFileImage('Gradient.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
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

test('Shadows', async () => {
  const image = await generateSketchFileImage('Shadows.sketch', 0);
  expect(Buffer.from(image)).toMatchImageSnapshot();
});

test('Symbols', async () => {
  const image = await generateSketchFileImage('Symbols.sketch', 0);
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
