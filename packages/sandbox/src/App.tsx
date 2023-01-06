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
  Layers,
  Selectors,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import * as React from 'react';
import { Suspense, useReducer } from 'react';
import { useWidget } from './useWidget';

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

function Widget({ layer }: { layer: Sketch.AnyLayer }) {
  const [state] = useApplicationState();
  const { frame } = useWidget({ layer });

  const symbol = Layers.isSymbolInstance(layer)
    ? Selectors.getSymbolMaster(state, layer.symbolID)
    : undefined;
  const isSelected = state.selectedLayerIds.includes(layer.do_objectID);

  if (!isSelected) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'black',
          color: 'white',
          pointerEvents: 'all',
          padding: '2px 4px',
          whiteSpace: 'pre',
          borderRadius: '4px',
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        ✨ {symbol?.name ?? layer.name}
      </div>
    </div>
  );
}

function Workspace(): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const reducer = React.useCallback(
    (state: WorkspaceState, action: any) =>
      workspaceReducer(state, action, CanvasKit, fontManager),
    [CanvasKit, fontManager],
  );

  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const workspace = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );

    workspace.history.present.sketch.pages.push(
      SketchModel.page({
        name: 'Symbols',
        layers: [buttonSymbol],
      }),
    );

    return workspace;
  });

  const layers = Layers.flat(Selectors.getCurrentPage(state.history.present));

  return (
    <div style={{ flex: '1', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex' }}>
        <StateProvider state={state} dispatch={dispatch}>
          <SimpleCanvas
            interactions={[
              Interactions.focus,
              Interactions.pan,
              Interactions.selection,
              Interactions.move,
              Interactions.createDrawing({
                initialState: 'none',
                defaultSymbol: buttonSymbol.do_objectID,
              }),
              Interactions.marquee,
            ]}
            widgets={
              <>
                {layers.map((layer) => (
                  <Widget key={layer.do_objectID} layer={layer} />
                ))}
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
        </StateProvider>
      </div>
      <div style={{ flex: '1', display: 'flex' }}>
        <StateProvider state={state}>
          <SimpleCanvas>
            {({ size }) => (
              <SVGRenderer size={size}>
                <RenderingModeProvider value="static">
                  <DesignFile />
                </RenderingModeProvider>
              </SVGRenderer>
            )}
          </SimpleCanvas>
        </StateProvider>
      </div>
    </div>
  );
}

export default function Embedded(): JSX.Element {
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
