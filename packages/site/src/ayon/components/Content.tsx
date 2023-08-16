import {
  DS,
  useGeneratedComponentDescriptions,
  useGeneratedLayouts,
  useNoyaClient,
} from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import {
  CanvasKitRenderer,
  Interactions,
  SimpleCanvas,
  convertPoint,
} from 'noya-canvas';
import { Stack, Toast } from 'noya-designsystem';
import { roundPoint } from 'noya-geometry';
import { amplitude } from 'noya-log';
import {
  FileDropTarget,
  OffsetPoint,
  useDeepMemo,
  useDeepState,
} from 'noya-react-utils';
import { Design, RenderingModeProvider, useCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { BlockContent, DrawableLayerType, Layers, Selectors } from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import { debounce } from 'noya-utils';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { IDSRenderer } from '../../dseditor/DSRenderer';
import { parseLayout } from '../../dseditor/componentLayout';
import { NoyaNode } from '../../dseditor/types';
import { measureImage } from '../../utils/measureImage';
import { inferBlockType } from '../infer/inferBlock';
import { Attribution } from '../resolve/RandomImageResolver';
import { resolveLayer } from '../resolve/resolve';
import { Stacking } from '../stacking';
import { useAyonState } from '../state/ayonState';
import { CustomLayerData, NodePath, ViewType } from '../types';
import { createCustomLayerInteraction } from '../utils/customLayerInteraction';
import { AttributionCard } from './AttributionCard';
import { DOMRenderer } from './DOMRenderer';
import { DrawingWidget, MultipleSelectionWidget, Widget } from './Widget';
import { AyonInspector } from './inspector/AyonInspector';

const Overlay = styled.div({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  display: 'flex',
});

type CanvasRendererType = 'canvas' | 'svg';

export const Content = memo(function Content({
  uploadAsset,
  viewType,
  padding,
  canvasRendererType = 'canvas',
  isPlayground,
  ds,
  onDuplicate,
  name,
  onChangeName,
}: {
  uploadAsset: (file: ArrayBuffer) => Promise<string>;
  viewType: ViewType;
  padding?: number;
  canvasRendererType?: CanvasRendererType;
  isPlayground?: boolean;
  ds: DS;
  onDuplicate?: () => void;
  name: string;
  onChangeName?: (name: string) => void;
}) {
  const client = useNoyaClient();
  const [toastData, setToastData] = useState<
    { attribution: Attribution; key: string } | undefined
  >();

  const setToastDataDebounced = useMemo(() => debounce(setToastData, 300), []);

  const { canvasSize, isContextMenuOpen } = useWorkspace();
  const [state, dispatch] = useAyonState();
  const layers = Layers.flat(Selectors.getCurrentPage(state)).filter(
    Layers.isSymbolInstance,
  );
  const { onboardingStep, setOnboardingStep } = useOnboarding();
  const CanvasKit = useCanvasKit();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;
  const getSymbolMaster = useCallback(
    (symbolId: string) => Selectors.getSymbolMaster(state, symbolId),
    [state],
  );

  const [overriddenBlock, setOverriddenBlock] = useDeepState<
    NoyaNode | undefined
  >();
  const [highlightedNodePath, setHighlightedNodePath] = useDeepState<
    NodePath | undefined
  >();

  const addImageFiles = async (files: File[], offsetPoint: OffsetPoint) => {
    const images = await Promise.all(
      files.map(async (file) => {
        const data = await file.arrayBuffer();
        const image =
          canvasRendererType === 'canvas'
            ? CanvasKit.MakeImageFromEncoded(data)
            : await measureImage(data);
        const url = await uploadAsset(data);
        const size = image
          ? { width: image.width(), height: image.height() }
          : undefined;
        return { url, size };
      }),
    );

    const layers = images.map((image) => {
      const symbol = SketchModel.symbolInstance({
        symbolID: 'd91ba1e3-7e64-4966-9cc1-daa48f989178',
      });
      symbol.blockText = image.url;
      symbol.frame.width = image.size?.width ?? 100;
      symbol.frame.height = image.size?.height ?? 100;
      symbol.symbolIDIsFixed = true;
      return symbol;
    });

    const point = convertPoint(
      scrollOrigin,
      zoomValue,
      roundPoint({ x: offsetPoint.offsetX, y: offsetPoint.offsetY }),
      'canvas',
    );

    dispatch('addLayer', layers, { point });
  };

  const customLayers = useDeepMemo(
    Layers.flat(Selectors.getCurrentPage(state)).filter(
      Layers.isCustomLayer<CustomLayerData>,
    ),
  );

  const { descriptions, loading: loadingDescriptions } =
    useGeneratedComponentDescriptions();
  const { layouts, loading: loadingLayouts } = useGeneratedLayouts();

  useEffect(() => {
    // Resolve descriptions. If a custom layer has a name but no description,
    // we trigger the generation of a description.
    customLayers.forEach((layer) => {
      if (!layer.name || layer.data.description !== undefined) return;

      const key = client.componentDescriptionCacheKey(layer.name);

      if (loadingDescriptions[key]) return;

      if (descriptions[key]) {
        dispatch('setLayerDescription', layer.do_objectID, descriptions[key]);
      } else {
        client.generate.componentDescription({ name: layer.name });
      }
    });
  }, [client, customLayers, descriptions, dispatch, loadingDescriptions]);

  useEffect(() => {
    // Resolve layouts. If a custom layer has a name and description but no node,
    // we trigger the generation of a layout.
    customLayers.forEach((layer) => {
      if (
        !layer.name ||
        layer.data.description === undefined ||
        layer.data.node !== undefined
      ) {
        return;
      }

      const key = client.componentLayoutCacheKey(
        layer.name,
        layer.data.description,
      );

      if (loadingLayouts[key]) return;

      if (layouts[key] && layouts[key][0]) {
        const node = parseLayout(layouts[key][0]);

        dispatch('setLayerNode', layer.do_objectID, node);
      } else {
        client.generate.componentLayouts({
          name: layer.name,
          description: layer.data.description,
        });
      }
    });
  }, [client, customLayers, dispatch, layouts, loadingLayouts]);

  useEffect(() => {
    if (isPlayground) return;

    const subscriptions = layers
      .filter(Layers.isSymbolInstance)
      .flatMap((layer) =>
        resolveLayer({
          layer,
          getSymbolMaster,
          onResolve: (resolved, attribution) => {
            dispatch('setResolvedBlockData', layer.do_objectID, resolved);

            if (attribution && resolved) {
              setToastDataDebounced({
                attribution,
                key: resolved.resolvedText,
              });
            }
          },
          onResolveOverride: (overrideName, resolved, attribution) => {
            dispatch(
              'setOverrideValue',
              [layer.do_objectID],
              overrideName,
              resolved,
            );

            if (attribution && resolved) {
              setToastDataDebounced({
                attribution,
                key: resolved.resolvedText,
              });
            }
          },
        }),
      );

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [dispatch, getSymbolMaster, isPlayground, layers, setToastDataDebounced]);

  const InteractiveRenderer =
    canvasRendererType === 'canvas' ? CanvasKitRenderer : SVGRenderer;

  const rendererRef = useRef<IDSRenderer>(null);

  const custom = createCustomLayerInteraction({
    onPointerDown: (event) => rendererRef.current?.mouseDown(event),
    onPointerMove: (event) => rendererRef.current?.mouseMove(event),
    onPointerUp: (event) => rendererRef.current?.mouseUp(event),
  });

  return (
    <>
      {toastData && (
        <Toast
          key={toastData.key}
          title="Image loaded"
          content={<AttributionCard {...toastData.attribution} />}
        />
      )}
      <Stack.H flex="1" alignItems="stretch" overflow="hidden">
        <FileDropTarget
          supportedFileTypes={[
            'image/png' as const,
            'image/jpeg' as const,
            'image/webp' as const,
          ]}
          onDropFiles={addImageFiles}
        >
          <SimpleCanvas
            autoFocus={!isPlayground}
            padding={padding}
            position={isPlayground ? undefined : 'top'}
            logEvent={amplitude.logEvent}
            interactions={
              isPlayground
                ? [
                    Interactions.escape,
                    Interactions.clipboard,
                    Interactions.createEditBlock({ inferBlockType }),
                    Interactions.selection,
                    Interactions.marquee,
                  ]
                : [
                    custom,
                    Interactions.selectionMode,
                    Interactions.duplicate,
                    Interactions.reorder,
                    Interactions.zoom,
                    Interactions.escape,
                    Interactions.history,
                    Interactions.clipboard,
                    Interactions.editText,
                    Interactions.createEditBlock({ inferBlockType }),
                    Interactions.focus,
                    Interactions.pan,
                    Interactions.scale,
                    Interactions.createInsertMode({ inferBlockType }),
                    Interactions.selection,
                    Interactions.move,
                    Interactions.marquee,
                    Interactions.createDrawing({
                      allowDrawingFromNoneState: false,
                      hasMovementThreshold: true,
                      inferBlockType,
                    }),
                    Interactions.defaultCursor,
                  ]
            }
            widgets={
              viewType !== 'previewOnly' && (
                <>
                  {layers
                    .filter(
                      // TODO: put this back
                      (layer) => false,
                    )
                    .map((layer) => (
                      <Widget
                        key={layer.do_objectID}
                        layer={layer}
                        showToolbar={!isPlayground}
                        setOverriddenBlock={(blockContent) => {
                          if (blockContent) {
                            // setOverriddenBlock({
                            //   layerId: layer.do_objectID,
                            //   blockContent,
                            // });
                          } else {
                            setOverriddenBlock(undefined);
                          }
                        }}
                        onChangeBlockType={(type: DrawableLayerType) => {
                          if (typeof type === 'string') return;

                          if (onboardingStep === 'insertedBlock') {
                            setOnboardingStep?.('configuredBlockType');
                          }

                          amplitude.logEvent('Project - Block - Changed Type', {
                            'Old Block Type': layer.symbolID,
                            'New Block Type': type.symbolId,
                            X: layer.frame.x,
                            Y: layer.frame.y,
                            Width: layer.frame.width,
                            Height: layer.frame.height,
                          });

                          dispatch(
                            'setSymbolInstanceSource',
                            type.symbolId,
                            'preserveCurrent',
                          );
                        }}
                        onChangeBlockContent={(content: BlockContent) => {
                          // const nextBlock =
                          //   Blocks[content.symbolId ?? layer.symbolID];
                          // const contentWithNormalizedText: BlockContent = {
                          //   ...content,
                          //   normalizedText:
                          //     content.blockText ?? nextBlock.placeholderText,
                          // };
                          // dispatch('batch', [
                          //   [
                          //     'setBlockContent',
                          //     layer.do_objectID,
                          //     contentWithNormalizedText,
                          //   ],
                          //   ...(contentWithNormalizedText.blockText !== ''
                          //     ? [
                          //         [
                          //           'setSymbolIdIsFixed',
                          //           layer.do_objectID,
                          //           true,
                          //         ] as Action,
                          //       ]
                          //     : []),
                          // ]);
                        }}
                        uploadAsset={uploadAsset}
                      />
                    ))}
                  {state.interactionState.type === 'drawing' && (
                    <DrawingWidget />
                  )}
                  {state.selectedLayerIds.length >= 2 && (
                    <MultipleSelectionWidget />
                  )}
                </>
              )
            }
          >
            {({ size }) =>
              viewType !== 'previewOnly' && (
                <>
                  <InteractiveRenderer size={size}>
                    <RenderingModeProvider value="interactive">
                      <Design.Root>
                        <Design.Background />
                        <Design.Page />
                        <Design.PixelGrid />
                        <Design.GradientEditor />
                        <Design.InsertSymbol />
                        <Design.DrawPath />
                        <Design.EditPath />
                      </Design.Root>
                    </RenderingModeProvider>
                  </InteractiveRenderer>
                </>
              )
            }
          </SimpleCanvas>
        </FileDropTarget>
        <Overlay
          style={
            viewType === 'previewOnly' ? { pointerEvents: 'all' } : undefined
          }
        >
          <DOMRenderer
            ref={rendererRef}
            overriddenBlock={overriddenBlock}
            resizeBehavior="match-canvas"
            ds={ds}
            sync={!isPlayground}
            highlightedNodePath={highlightedNodePath}
            setHighlightedNodePath={setHighlightedNodePath}
          />
        </Overlay>
        {viewType === 'combined' && (
          <>
            {!isPlayground && (
              <AyonInspector
                name={name}
                onChangeName={onChangeName}
                onDuplicate={onDuplicate}
                highlightedNodePath={highlightedNodePath}
                setHighlightedNodePath={setHighlightedNodePath}
                setPreviewNode={setOverriddenBlock}
              />
            )}
            <Overlay>
              <SVGRenderer size={canvasSize}>
                <RenderingModeProvider value="interactive">
                  <Design.Root>
                    <Design.BoundingRect />
                    <Design.LayerHighlight />
                  </Design.Root>
                </RenderingModeProvider>
              </SVGRenderer>
            </Overlay>
            <Overlay
              style={{
                zIndex: isContextMenuOpen ? undefined : Stacking.level.overlay,
              }}
            >
              <SVGRenderer size={canvasSize}>
                <RenderingModeProvider value="interactive">
                  <Design.Root>
                    <Design.DrawLayer />
                    <Design.SnapGuides showLabels={false} />
                    <Design.MeasurementGuides showLabels={false} />
                    {!isPlayground && <Design.DragHandles />}
                    {!isPlayground && <Design.Marquee />}
                  </Design.Root>
                </RenderingModeProvider>
              </SVGRenderer>
            </Overlay>
          </>
        )}
      </Stack.H>
    </>
  );
});
