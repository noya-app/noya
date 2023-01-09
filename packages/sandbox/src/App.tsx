import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { StateProvider, useApplicationState } from 'noya-app-state-context';
import { CanvasKitRenderer, Interactions, SimpleCanvas } from 'noya-canvas';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { setPublicPath } from 'noya-public-path';
import {
  CanvasKitProvider,
  DesignFile,
  FontManagerProvider,
  ImageCacheProvider,
  RenderingModeProvider,
  useCanvasKit,
  useFontManager,
} from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import {
  createInitialWorkspaceState,
  createSketchFile,
  DrawableLayerType,
  Layers,
  Selectors,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import * as React from 'react';
import { Suspense, useReducer } from 'react';
import { BlockHeuristicInput, InferredBlockTypeResult } from './types';
import { DrawingWidget, Widget } from './Widget';
const { AppProvider, Avatar, Button } = require('@shopify/polaris');

let initialized = false;

const rectangle = SketchModel.rectangle({
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }),
  style: SketchModel.style({
    fills: [
      SketchModel.fill({
        color: SketchModel.color({ red: 1, alpha: 1 }),
      }),
    ],
  }),
});

const artboard = SketchModel.artboard({
  name: 'Wireframe',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 400,
    height: 800,
  }),
  layers: [rectangle],
});

const buttonSymbol = SketchModel.symbolMaster({
  name: 'Button',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 100,
    height: 30,
  }),
  layers: [
    SketchModel.rectangle({
      frame: SketchModel.rect({
        x: 0,
        y: 0,
        width: 100,
        height: 30,
      }),
      style: SketchModel.style({
        fills: [
          SketchModel.fill({
            color: SketchModel.color({ red: 0, green: 0.5, blue: 1, alpha: 1 }),
          }),
        ],
      }),
    }),
    SketchModel.text({
      frame: SketchModel.rect({
        x: 6,
        y: 4,
        width: 100 - 12,
        height: 30 - 8,
      }),
      attributedString: SketchModel.attributedString({
        string: 'Button',
        attributes: [
          SketchModel.stringAttribute({
            location: 0,
            length: 6,
            attributes: {
              ...SketchModel.stringAttribute().attributes,
              MSAttributedStringColorAttribute: SketchModel.WHITE,
            },
          }),
        ],
      }),
    }),
  ],
});

const avatarSymbol = SketchModel.symbolMaster({
  name: 'Avatar',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 60,
    height: 60,
  }),
  layers: [
    SketchModel.rectangle({
      frame: SketchModel.rect({
        x: 0,
        y: 0,
        width: 60,
        height: 60,
      }),
      style: SketchModel.style({
        fills: [
          SketchModel.fill({
            color: SketchModel.color({ red: 0.5, green: 0, blue: 0, alpha: 1 }),
          }),
        ],
      }),
    }),
  ],
});

const BLOCK_TYPE_HEURISTICS = {
  [buttonSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [avatarSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    if (
      rect.width > 30 &&
      rect.width < 50 &&
      rect.height > 30 &&
      rect.height < 50 &&
      rect.width / rect.height > 0.8 &&
      rect.width / rect.height < 1.2
    ) {
      return 1;
    } else {
      return 0;
    }
  },
};

function inferBlockTypes(
  input: BlockHeuristicInput,
): InferredBlockTypeResult[] {
  let results: InferredBlockTypeResult[] = [];

  for (const [symbolId, heuristicFunction] of Object.entries(
    BLOCK_TYPE_HEURISTICS,
  )) {
    results.push({
      type: { symbolId },
      score: heuristicFunction(input) ?? 0,
    });
  }

  results.sort(
    (
      a: { type: DrawableLayerType; score: number },
      b: { type: DrawableLayerType; score: number },
    ) => b.score - a.score,
  );
  return results;
}

function inferBlockType(input: BlockHeuristicInput): DrawableLayerType {
  return inferBlockTypes(input)[0].type;
}

function Content() {
  const [state, dispatch] = useApplicationState();

  const layers = Layers.flat(Selectors.getCurrentPage(state));

  return (
    <div style={{ flex: '1', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex' }}>
        <SimpleCanvas
          interactions={[
            Interactions.editText,
            Interactions.editBlock,
            Interactions.focus,
            Interactions.pan,
            Interactions.scale,
            Interactions.selection,
            Interactions.move,
            Interactions.createDrawing({
              initialState: 'none',
              inferBlockType: inferBlockType,
            }),
          ]}
          widgets={
            <>
              {layers.map((layer) => (
                <Widget
                  key={layer.do_objectID}
                  layer={layer}
                  inferBlockTypes={inferBlockTypes}
                  onChangeBlockType={(type: DrawableLayerType) => {
                    dispatch(
                      'setInstanceSymbolSource',
                      typeof type !== 'string'
                        ? type.symbolId
                        : buttonSymbol.symbolID,
                      'preserveCurrent',
                    );
                  }}
                />
              ))}
              {state.interactionState.type === 'drawing' && (
                <DrawingWidget inferBlockType={inferBlockType} />
              )}
            </>
          }
        >
          {({ size }) => (
            <CanvasKitRenderer size={size}>
              <RenderingModeProvider value="interactive">
                <DesignFile />
              </RenderingModeProvider>
            </CanvasKitRenderer>
          )}
        </SimpleCanvas>
      </div>
      <div style={{ flex: '1', display: 'flex' }}>
        <DOMRenderer />
      </div>
    </div>
  );
}

function Workspace(): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const reducer = React.useCallback(
    (state: WorkspaceState, action: WorkspaceAction) =>
      workspaceReducer(state, action, CanvasKit, fontManager),
    [CanvasKit, fontManager],
  );

  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const workspace = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );
    workspace.preferences.showDotGrid = true;
    workspace.preferences.wireframeMode = true;
    workspace.history.present.sketch.pages.push(
      SketchModel.page({
        name: 'Symbols',
        layers: [buttonSymbol, avatarSymbol],
      }),
    );

    return workspace;
  });

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content />
    </StateProvider>
  );
}

const symbolIdToElement = {
  [buttonSymbol.symbolID]: (layer: Sketch.SymbolInstance) => {
    let size;
    if (layer.frame.height < 30) {
      size = 'slim' as const;
    } else if (layer.frame.height > 50) {
      size = 'large' as const;
    } else {
      size = 'medium' as const;
    }
    return (
      <Button fullWidth size={size}>
        {layer.blockText}
      </Button>
    );
  },
  [avatarSymbol.symbolID]: (layer: Sketch.SymbolInstance) => <Avatar />,
};

function DOMRenderer(): JSX.Element {
  const [state] = useApplicationState();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;
  return (
    <div style={{ position: 'relative' }}>
      <AppProvider i18n={enTranslations}>
        {artboard.layers.map((layer) => {
          return (
            <div
              key={layer.do_objectID}
              style={{
                position: 'absolute',
                left: layer.frame.x,
                top: layer.frame.y,
                width: layer.frame.width,
                height: layer.frame.height,
              }}
            >
              {Layers.isSymbolInstance(layer) &&
                typeof symbolIdToElement[layer.symbolID] === 'function' &&
                symbolIdToElement[layer.symbolID](layer)}
            </div>
          );
        })}
      </AppProvider>
    </div>
  );
}

export default function App(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <DesignSystemConfigurationProvider theme={lightTheme} platform={'key'}>
      <Suspense fallback="Loading">
        <ImageCacheProvider>
          <CanvasKitProvider>
            <FontManagerProvider>
              <Workspace />
            </FontManagerProvider>
          </CanvasKitProvider>
        </ImageCacheProvider>
      </Suspense>
    </DesignSystemConfigurationProvider>
  );
}
