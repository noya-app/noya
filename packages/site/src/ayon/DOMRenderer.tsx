import {
  component,
  DesignSystemDefinition,
  RenderableRoot,
} from '@noya-design-system/protocol';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  createResizeTransform,
  Rect,
  Size,
  transformRect,
} from 'noya-geometry';
import { loadDesignSystem } from 'noya-module-loader';
import { useSize } from 'noya-react-utils';
import { BlockProps, InteractionState, Layers, Selectors } from 'noya-state';
import React, {
  ComponentProps,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { Blocks } from './blocks/blocks';

class ErrorBoundary extends React.Component<any> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    return this.props.children;
  }
}

function renderDynamicContent(
  system: DesignSystemDefinition,
  layers: Sketch.Artboard['layers'],
  drawing: Extract<InteractionState, { type: 'drawing' }> | undefined,
) {
  const {
    createElement: h,
    components: { [component.id.provider]: Provider },
  } = system;
  const env = {
    h: system.createElement,
    Components: system.components,
  };

  const getBlock = (symbolId: string) => Blocks[symbolId];

  function SymbolRenderer({
    key,
    layer,
    dataSet,
    frame,
    symbolId,
    blockText,
    resolvedBlockData,
    getBlock,
  }: BlockProps & { frame: Rect; symbolId: string; key: string }) {
    const block = getBlock(symbolId);

    if (!env.Components[symbolId] && !block.isComposedBlock) {
      return null;
    }

    return h(
      'div',
      {
        key,
        style: {
          position: 'absolute',
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
        },
      },
      getBlock(symbolId).render(env, {
        layer,
        dataSet,
        symbolId,
        frame,
        blockText,
        resolvedBlockData,
        getBlock,
      }),
    );
  }

  const content = [
    layers.filter(Layers.isSymbolInstance).map((layer) => {
      return SymbolRenderer({
        key: layer.do_objectID,
        layer,
        dataSet: {
          id: layer.do_objectID,
          parentId: layer.do_objectID,
        },
        frame: layer.frame,
        symbolId: layer.symbolID,
        blockText: layer.blockText,
        resolvedBlockData: layer.resolvedBlockData,
        getBlock,
      });
    }),
    ...(drawing
      ? [
          SymbolRenderer({
            key: 'drawing',
            frame: Selectors.getDrawnLayerRect(
              drawing.origin,
              drawing.current,
              drawing.options,
            ),
            symbolId:
              typeof drawing.shapeType === 'string'
                ? component.id.button
                : drawing.shapeType.symbolId,
            getBlock,
          }),
        ]
      : []),
  ];

  return (h as unknown as any)(
    'div',
    {},
    Provider ? (h as unknown as any)(Provider, {}, content) : content,
  );
}

function DynamicRenderer({
  artboard,
  designSystem,
  drawing,
}: {
  artboard: Sketch.Artboard;
  designSystem: string;
  drawing: Extract<InteractionState, { type: 'drawing' }> | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();
  const [root, setRoot] = React.useState<RenderableRoot | undefined>();

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(designSystem);
      setSystem(system);
    }

    setSystem(undefined);

    fetchLibrary();
  }, [designSystem]);

  useEffect(() => {
    if (system && !root) {
      setRoot(system.createRoot(ref.current!));
    } else if (!system && root) {
      root.unmount();
      setRoot(undefined);
    }
  }, [root, system]);

  useLayoutEffect(() => {
    if (!root || !system) return;

    root.render(renderDynamicContent(system, artboard.layers, drawing));
  }, [artboard.layers, designSystem, drawing, root, system]);

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    />
  );
}

function DOMRendererContent({
  size,
  resizeBehavior,
  padding = 0,
  designSystem,
}: {
  size: Size;
  resizeBehavior: ResizeBehavior;
  padding?: number;
  designSystem: string;
}): JSX.Element {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;
  const rect = Selectors.getBoundingRect(page, [artboard.do_objectID])!;

  const containerTransform = createResizeTransform(artboard.frame, size, {
    scalingMode: 'down',
    resizePosition: 'top',
    padding,
  });
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const transform =
    resizeBehavior === 'match-canvas' ? canvasTransform : containerTransform;

  const paddedRect = transformRect(rect, transform);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          width: paddedRect.width,
          height: paddedRect.height,
          left: paddedRect.x,
          top: paddedRect.y,
          outline: '1px solid #e0e0e0',
        }}
      />
      <div
        style={{
          position: 'absolute',
          transform: transform.toString(),
          transformOrigin: 'top left',
          background: 'white',
          width: rect.width,
          height: rect.height,
          overflow: 'hidden',
        }}
      >
        <ErrorBoundary>
          <DynamicRenderer
            artboard={artboard}
            designSystem={designSystem}
            drawing={
              state.interactionState.type === 'drawing'
                ? state.interactionState
                : undefined
            }
          />
        </ErrorBoundary>
      </div>
    </>
  );
}

type ResizeBehavior = 'match-canvas' | 'fit-container';

export function DOMRenderer(
  props: Omit<ComponentProps<typeof DOMRendererContent>, 'size'>,
): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        {size && <DOMRendererContent size={size} {...props} />}
      </div>
    </div>
  );
}
