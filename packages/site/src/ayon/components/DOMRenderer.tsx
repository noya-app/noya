import {
  DesignSystemDefinition,
  RenderableRoot,
  Theme,
  transform,
} from '@noya-design-system/protocol';
import produce from 'immer';
import { DS } from 'noya-api';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { Size, createResizeTransform, transformRect } from 'noya-geometry';
import { DesignSystemCache, loadDesignSystem } from 'noya-module-loader';
import { useSize } from 'noya-react-utils';
import {
  InteractionState,
  Layers,
  OverriddenBlockContent,
  Selectors,
} from 'noya-state';
import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { tailwindColors } from '../tailwind/tailwind.config';
import { recreateElement } from '../utils/recreateElement';
import { renderDynamicContent } from '../utils/renderDynamicContent';

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

function DynamicRenderer({
  artboard,
  ds,
  drawing,
  sync,
}: {
  artboard: Sketch.Artboard;
  ds: DS;
  drawing: Extract<InteractionState, { type: 'drawing' }> | undefined;
  sync: boolean;
}) {
  const [state] = useApplicationState();
  const ref = useRef<HTMLDivElement>(null);

  const [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >(DesignSystemCache.get(ds.source.name));
  const [root, setRoot] = React.useState<RenderableRoot | undefined>();

  const isInitialRender = useRef(true);

  const getSymbolMaster = useCallback(
    (symbolId: string) => Selectors.getSymbolMaster(state, symbolId),
    [state],
  );

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(ds.source.name);
      setSystem(system);
    }

    if (isInitialRender.current && DesignSystemCache.has(ds.source.name)) {
      isInitialRender.current = false;
      return;
    }

    isInitialRender.current = false;
    setSystem(undefined);
    fetchLibrary();
  }, [ds]);

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

    const t: Theme = {
      colors: {
        primary: (tailwindColors as any)[ds.config.colors.primary as any],
        neutral: tailwindColors.slate,
      },
    };

    const themeValue = transform({ theme: t }, system.themeTransformer);

    return themeValue;
  }, [ds.config.colors.primary, system]);

  useLayoutEffect(() => {
    if (!root || !system) return;

    const content = renderDynamicContent(
      system,
      artboard,
      getSymbolMaster,
      drawing,
      theme,
      'absolute-layout',
    );

    root.render(recreateElement(system, content), { sync });
  }, [artboard, ds, drawing, getSymbolMaster, root, sync, system, theme]);

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
        layer.overrideValues =
          overriddenBlock.blockContent.overrides ?? layer.overrideValues;
      }
    }
  });
}

function DOMRendererContent({
  size,
  resizeBehavior,
  padding = 0,
  ds,
  overriddenBlock,
  sync,
}: {
  size: Size;
  resizeBehavior: ResizeBehavior;
  padding?: number;
  ds: DS;
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
            ds={ds}
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
