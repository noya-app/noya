import { DS, useNoyaClient } from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import { lightTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { Size, createResizeTransform, transformRect } from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React, {
  ComponentProps,
  forwardRef,
  memo,
  useCallback,
  useRef,
} from 'react';
import { DSControlledRenderer } from '../../dseditor/DSControlledRenderer';
import { IDSRenderer } from '../../dseditor/DSRenderer';
import { Model } from '../../dseditor/builders';
import { initialComponents } from '../../dseditor/builtins';
import { renderResolvedNode } from '../../dseditor/renderDSPreview';
import { ResolvedHierarchy } from '../../dseditor/resolvedHierarchy';
import { createResolvedNode, unresolve } from '../../dseditor/traversal';
import { NoyaNode, NoyaResolvedString } from '../../dseditor/types';
import { useAyonState } from '../state/ayonState';
import { boxSymbolId, textSymbolId } from '../symbols/symbolIds';
import { CustomLayerData, NodePath } from '../types';
import { useManagedLayouts } from './GeneratedLayoutContext';

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

const DOMRendererContent = memo(
  forwardRef(function DOMRendererContent(
    {
      size,
      resizeBehavior,
      padding = 0,
      ds,
      overriddenBlock,
      sync,
      highlightedNodePath,
      setHighlightedNodePath,
    }: {
      size: Size;
      resizeBehavior: ResizeBehavior;
      padding?: number;
      ds: DS;
      overriddenBlock?: NoyaNode;
      sync: boolean;
      highlightedNodePath?: NodePath;
      setHighlightedNodePath?: (path: NodePath | undefined) => void;
    },
    forwardedRef: React.ForwardedRef<IDSRenderer>,
  ): JSX.Element {
    const client = useNoyaClient();
    const [state, dispatch] = useAyonState();
    const { canvasInsets } = useWorkspace();
    const page = Selectors.getCurrentPage(state);
    const artboard = page.layers[0] as Sketch.Artboard;
    const rect = Selectors.getBoundingRect(page, [artboard.do_objectID])!;
    const editingLayerId =
      state.interactionState.type === 'editingBlock'
        ? state.interactionState.layerId
        : undefined;
    const selectedLayerId =
      state.selectedLayerIds.length === 1
        ? state.selectedLayerIds[0]
        : undefined;

    const containerTransform = createResizeTransform(artboard.frame, size, {
      scalingMode: 'down',
      // resizePosition: 'top',
      padding,
    });
    const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
    const transform =
      resizeBehavior === 'match-canvas' ? canvasTransform : containerTransform;

    const paddedRect = transformRect(rect, transform);

    const findComponent = useCallback(
      (id: string) =>
        initialComponents.find((component) => component.componentID === id),
      [],
    );
    const generatedLayouts = useManagedLayouts();

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
            display: 'flex',
          }}
        >
          <ErrorBoundary>
            <DSControlledRenderer
              ref={forwardedRef}
              sourceName={ds.source.name}
              primary={ds.config.colors.primary}
              sync={sync}
              setHighlightedPath={(path) => {
                if (!selectedLayerId) return;

                setHighlightedNodePath?.(
                  path ? { layerId: selectedLayerId, path } : undefined,
                );
              }}
              onChangeTextAtPath={({ path, value }) => {
                const layer = artboard.layers
                  .filter(Layers.isCustomLayer<CustomLayerData>)
                  .find((layer) => layer.do_objectID === editingLayerId);

                if (!layer || !layer.data.node) return undefined;

                const resolvedNode = createResolvedNode(
                  findComponent,
                  layer.data.node,
                );

                const indexPath = ResolvedHierarchy.findIndexPath(
                  resolvedNode,
                  (node) => node.path.join('/') === path.join('/'),
                );

                if (!indexPath) return;

                const originalNode = ResolvedHierarchy.access(
                  resolvedNode,
                  indexPath,
                ) as NoyaResolvedString;

                const newResolvedNode = ResolvedHierarchy.replace(
                  resolvedNode,
                  {
                    at: indexPath,
                    node: { ...originalNode, value },
                  },
                );

                const newNode = unresolve(newResolvedNode);

                dispatch('setLayerNode', layer.do_objectID, newNode);
              }}
              getStringValueAtPath={(path) => {
                const layer = artboard.layers
                  .filter(Layers.isCustomLayer<CustomLayerData>)
                  .find((layer) => layer.do_objectID === editingLayerId);

                if (!layer) return undefined;

                const resolvedNode = createResolvedNode(
                  findComponent,
                  layer.data.node ??
                    Model.primitiveElement({
                      componentID: boxSymbolId,
                    }),
                );

                if (!resolvedNode) return undefined;

                return ResolvedHierarchy.find<NoyaResolvedString>(
                  resolvedNode,
                  (node): node is NoyaResolvedString =>
                    node.type === 'noyaString' &&
                    node.path.join('/') === path.join('/'),
                )?.value;
              }}
              renderContent={(props) => {
                const layers = artboard.layers.filter(
                  Layers.isCustomLayer<CustomLayerData>,
                );

                return layers.map((layer) => {
                  function createLoadingNode() {
                    if (!layer.data.description) return;

                    const key = client.componentLayoutCacheKey(
                      layer.name,
                      layer.data.description,
                    );

                    const layouts = generatedLayouts[key];
                    const activeIndex = layer.data.activeGenerationIndex ?? 0;

                    if (!layouts || !layouts[activeIndex]) return undefined;

                    return layouts[activeIndex].node;
                  }

                  function createPlaceholderNode() {
                    return Model.primitiveElement({
                      componentID: boxSymbolId,
                      classNames: [
                        Model.className('flex-1'),
                        Model.className('flex'),
                        Model.className('items-center'),
                        Model.className('justify-center'),
                        Model.className('text-center'),
                        Model.className('p-4'),
                      ],
                      children: [
                        layer.data.description === undefined
                          ? Model.primitiveElement({
                              componentID: textSymbolId,
                              children: [
                                Model.string(
                                  `Generating ${layer.name} description...`,
                                ),
                              ],
                            })
                          : Model.primitiveElement({
                              componentID: textSymbolId,
                              children: [
                                Model.string(
                                  `Generating ${layer.name} layout...`,
                                ),
                              ],
                            }),
                      ],
                    });
                  }

                  const resolvedNode = createResolvedNode(
                    findComponent,
                    layer.do_objectID === selectedLayerId && overriddenBlock
                      ? overriddenBlock
                      : layer.data.node ??
                          createLoadingNode() ??
                          createPlaceholderNode(),
                  );

                  const content = renderResolvedNode({
                    resolvedNode,
                    primary: props.primary,
                    system: props.system,
                    highlightedPath:
                      highlightedNodePath &&
                      layer.do_objectID === highlightedNodePath.layerId
                        ? highlightedNodePath.path
                        : undefined,
                    selectionOutlineColor: lightTheme.colors.secondary,
                  });

                  return (
                    <div
                      key={layer.do_objectID}
                      className={
                        !layer.data.node ? 'noya-skeleton-shimmer' : undefined
                      }
                      style={{
                        position: 'absolute',
                        top: layer.frame.y,
                        left: layer.frame.x,
                        width: layer.frame.width,
                        height: layer.frame.height,
                        overflow: 'hidden',
                        display: 'flex',
                      }}
                    >
                      {content}
                    </div>
                  );
                });
              }}
            />
          </ErrorBoundary>
        </div>
      </>
    );
  }),
);

type ResizeBehavior = 'match-canvas' | 'fit-container';

export const DOMRenderer = memo(
  forwardRef(function DOMRenderer(
    props: Omit<ComponentProps<typeof DOMRendererContent>, 'size'>,
    forwardedRef: React.ForwardedRef<IDSRenderer>,
  ): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);
    const size = useSize(containerRef);

    return (
      <div style={{ display: 'flex', flex: 1 }}>
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
          {size && (
            <DOMRendererContent ref={forwardedRef} size={size} {...props} />
          )}
        </div>
      </div>
    );
  }),
);
