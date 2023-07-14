import {
  DesignSystemDefinition,
  RenderableRoot,
  component,
  defaultTheme,
  transform,
} from '@noya-design-system/protocol';
import produce from 'immer';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { Size, createResizeTransform, transformRect } from 'noya-geometry';
import { DesignSystemCache, loadDesignSystem } from 'noya-module-loader';
import { useSize } from 'noya-react-utils';
import { SketchModel } from 'noya-sketch-model';
import {
  InteractionState,
  Layers,
  OverriddenBlockContent,
  Selectors,
  createOverrideHierarchy,
} from 'noya-state';
import React, {
  ComponentProps,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { boxSymbol } from '../symbols/primitive/BoxSymbol';
import { symbolMap } from '../symbols/symbols';
import { recreateElement } from '../utils/recreateElement';

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
  artboard: Sketch.Artboard,
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster,
  drawing: Extract<InteractionState, { type: 'drawing' }> | undefined,
  theme: unknown,
) {
  const Provider = system.components[component.id.Provider];

  type RenderableItem = {
    instance: Sketch.SymbolInstance;
    nested: RenderableItem[];
  };

  function renderSymbol({ instance, nested }: RenderableItem): ReactNode {
    const master = symbolMap[instance.symbolID];

    if (!master) return null;

    const render =
      master.blockDefinition?.render ?? boxSymbol.blockDefinition!.render!;

    const content: ReactNode = render({
      Components: system.components,
      instance: produce(instance, (draft) => {
        draft.blockParameters =
          instance.blockParameters ??
          master.blockDefinition?.placeholderParameters;
      }),
      getSymbolMaster,
      children: nested.map(renderSymbol),
    });

    return content;
  }

  function renderTopLevelSymbol({
    instance,
    nested,
  }: RenderableItem): ReactNode {
    const content = renderSymbol({ instance, nested });

    return (
      <div
        key={instance.do_objectID}
        style={{
          position: 'absolute',
          left: instance.frame.x,
          top: instance.frame.y,
          width: instance.frame.width,
          height: instance.frame.height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {content}
      </div>
    );
  }

  const drawingLayer = drawing
    ? SketchModel.symbolInstance({
        do_objectID: 'drawing',
        frame: SketchModel.rect(
          Selectors.getDrawnLayerRect(
            drawing.origin,
            drawing.current,
            drawing.options,
          ),
        ),
        symbolID:
          typeof drawing.shapeType === 'string'
            ? component.id.Button
            : drawing.shapeType.symbolId,
      })
    : undefined;

  const hierarchy = createOverrideHierarchy(
    getSymbolMaster,
  ).map<RenderableItem>(artboard, (instance, transformedChildren) => {
    return {
      instance: instance as Sketch.SymbolInstance,
      nested: transformedChildren,
    };
  });

  const content = [
    ...hierarchy.nested.map(renderTopLevelSymbol),
    ...(drawingLayer
      ? [renderTopLevelSymbol({ instance: drawingLayer, nested: [] })]
      : []),
  ];

  return Provider ? <Provider theme={theme}>{content}</Provider> : content;
}

function DynamicRenderer({
  artboard,
  designSystem,
  drawing,
  sync,
}: {
  artboard: Sketch.Artboard;
  designSystem: string;
  drawing: Extract<InteractionState, { type: 'drawing' }> | undefined;
  sync: boolean;
}) {
  const [state] = useApplicationState();
  const ref = useRef<HTMLDivElement>(null);

  const [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >(DesignSystemCache.get(designSystem));
  const [root, setRoot] = React.useState<RenderableRoot | undefined>();

  const isInitialRender = useRef(true);

  const getSymbolMaster = useCallback(
    (symbolId: string) => Selectors.getSymbolMaster(state, symbolId),
    [state],
  );

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(designSystem);
      setSystem(system);
    }

    if (isInitialRender.current && DesignSystemCache.has(designSystem)) {
      isInitialRender.current = false;
      return;
    }

    isInitialRender.current = false;
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

  const theme = useMemo(() => {
    if (!system || !system.themeTransformer) return undefined;

    const themeValue = transform(
      { theme: defaultTheme },
      system.themeTransformer,
    );

    return themeValue;
  }, [system]);

  useLayoutEffect(() => {
    if (!root || !system) return;

    const content = renderDynamicContent(
      system,
      artboard,
      getSymbolMaster,
      drawing,
      theme,
    );

    root.render(recreateElement(system, content), { sync });
  }, [
    artboard,
    designSystem,
    drawing,
    getSymbolMaster,
    root,
    sync,
    system,
    theme,
  ]);

  return (
    <>
      <div
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      />
      {!system && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '4px 8px',
            color: '#aaa',
            pointerEvents: 'none',
          }}
        >
          Loading design system...
        </div>
      )}
    </>
  );
}

function overrideBlockContent<T extends Sketch.AnyLayer>(
  layer: T,
  overriddenBlock: OverriddenBlockContent,
) {
  return produce(layer, (draft) => {
    const indexPath = Layers.findIndexPath(
      draft,
      (layer) => layer.do_objectID === overriddenBlock.layerId,
    );

    if (indexPath) {
      const layer = Layers.access(draft, indexPath);

      if (Layers.isSymbolInstance(layer)) {
        layer.symbolID =
          overriddenBlock.blockContent.symbolId ?? layer.symbolID;
        layer.blockText =
          overriddenBlock.blockContent.blockText ?? layer.blockText;
        layer.blockParameters =
          overriddenBlock.blockContent.blockParameters ?? layer.blockParameters;
      }
    }
  });
}

function DOMRendererContent({
  size,
  resizeBehavior,
  padding = 0,
  designSystem,
  overriddenBlock,
  sync,
}: {
  size: Size;
  resizeBehavior: ResizeBehavior;
  padding?: number;
  designSystem: string;
  overriddenBlock?: OverriddenBlockContent;
  sync: boolean;
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

  const overriddenArtboard = overriddenBlock
    ? overrideBlockContent(artboard, overriddenBlock)
    : artboard;

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
            sync={sync}
            artboard={overriddenArtboard}
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
