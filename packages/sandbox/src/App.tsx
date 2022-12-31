import { CanvasKit } from 'canvaskit';
import { StateProvider } from 'noya-app-state-context';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { setPublicPath } from 'noya-public-path';
import {
  CanvasKitProvider,
  FontManagerProvider,
  IFontManager,
  useCanvasKit,
  useFontManager,
} from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import {
  createInitialWorkspaceState,
  createSketchFile,
  Selectors,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import * as React from 'react';
import { Suspense, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { Content } from './Content';

export const GlobalStyles = createGlobalStyle(({ theme }) => ({
  '*': {
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  },
  html: {
    width: '100%',
    minHeight: '100vh',
  },
  'body, #root': {
    flex: '1',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    background: theme.colors.canvas.background,
  },
}));

let initialized = false;

const rectangle = SketchModel.rectangle({
  frame: SketchModel.rect({
    x: -500,
    y: -500,
    width: 1000,
    height: 1000,
  }),
  style: SketchModel.style({
    fills: [
      SketchModel.fill({ color: SketchModel.color({ red: 1, alpha: 1 }) }),
    ],
  }),
});

function panToFit(
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  workspaceState: WorkspaceState,
  pageIndex: number,
  padding = 0,
) {
  const page = workspaceState.history.present.sketch.pages[pageIndex];

  workspaceState = workspaceReducer(
    workspaceState,
    ['selectPage', page.do_objectID],
    CanvasKit,
    fontManager,
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
    fontManager,
  );

  workspaceState = workspaceReducer(
    workspaceState,
    ['pan*', delta],
    CanvasKit,
    fontManager,
  );

  return {
    size: canvasSize,
    workspaceState,
  };
}

function Workspace(): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const workspaceState = useMemo(() => {
    let workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    // const page = workspaceState.history.present.sketch.pages[0];

    // workspaceState = workspaceReducer(
    //   workspaceState,
    //   ['selectLayer', rectangle.do_objectID],
    //   CanvasKit,
    //   fontManager,
    // );
    // const canvasSize = { width: 500, height: 500 };
    // workspaceState = workspaceReducer(
    //   workspaceState,
    //   ['setCanvasSize', canvasSize, { top: 0, right: 0, bottom: 0, left: 0 }],
    //   CanvasKit,
    //   fontManager,
    // );
    // workspaceState = workspaceReducer(
    //   workspaceState,
    //   ['zoomToFit*', 'selection'],
    //   CanvasKit,
    //   fontManager,
    // );

    const results = panToFit(CanvasKit, fontManager, workspaceState, 0, 0);
    workspaceState = results.workspaceState;

    return workspaceState;
  }, [CanvasKit, fontManager]);
  return (
    <StateProvider state={workspaceState}>
      <Content />
    </StateProvider>
  );
}

export default function Embedded(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <DesignSystemConfigurationProvider theme={darkTheme} platform={'key'}>
      <GlobalStyles />
      <Suspense fallback="Loading">
        <CanvasKitProvider>
          <FontManagerProvider>
            <Workspace />
          </FontManagerProvider>
        </CanvasKitProvider>
      </Suspense>
    </DesignSystemConfigurationProvider>
  );
}
