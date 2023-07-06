import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  CanvasKitRenderer,
  Interactions,
  SimpleCanvas,
  convertPoint,
} from 'noya-canvas';
import { Stack, Toast } from 'noya-designsystem';
import { roundPoint } from 'noya-geometry';
import { amplitude } from 'noya-log';
import { FileDropTarget, OffsetPoint } from 'noya-react-utils';
import { Design, RenderingModeProvider, useCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import {
  Action,
  BlockContent,
  DrawableLayerType,
  Layers,
  OverriddenBlockContent,
  Selectors,
} from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import { debounce, isDeepEqual } from 'noya-utils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useOnboarding } from '../contexts/OnboardingContext';
import { measureImage } from '../utils/measureImage';
import { AttributionCard } from './AttributionCard';
import { DOMRenderer } from './DOMRenderer';
import { DrawingWidget, MultipleSelectionWidget, Widget } from './Widget';
import { Blocks } from './blocks/blocks';
import { inferBlockType } from './inferBlock';
import { AyonInspector } from './inspector/AyonInspector';
import { parseBlock } from './parse';
import { Attribution } from './resolve/RandomImageResolver';
import { resolveLayer } from './resolve/resolve';
import { Stacking } from './stacking';
import { ViewType } from './types';

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
  designSystem,
}: {
  uploadAsset: (file: ArrayBuffer) => Promise<string>;
  viewType: ViewType;
  padding?: number;
  canvasRendererType?: CanvasRendererType;
  isPlayground?: boolean;
  designSystem: string;
}) {
  const [toastData, setToastData] = useState<
    { attribution: Attribution; key: string } | undefined
  >();

  const setToastDataDebounced = useMemo(() => debounce(setToastData, 300), []);

  const { canvasSize, isContextMenuOpen } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const layers = Layers.flat(Selectors.getCurrentPage(state)).filter(
    Layers.isSymbolInstance,
  );
  const { onboardingStep, setOnboardingStep } = useOnboarding();
  const CanvasKit = useCanvasKit();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;

  const [overriddenBlock, _setOverriddenBlock] = React.useState<
    OverriddenBlockContent | undefined
  >();

  // Prevent infinite loop by only updating the overridden block when the value actually changes
  const setOverriddenBlock = useCallback(
    (value: OverriddenBlockContent | undefined) => {
      if (
        value?.layerId === overriddenBlock?.layerId &&
        value?.blockContent.symbolId ===
          overriddenBlock?.blockContent.symbolId &&
        value?.blockContent.blockText ===
          overriddenBlock?.blockContent.blockText &&
        isDeepEqual(
          value?.blockContent.blockParameters,
          overriddenBlock?.blockContent.blockParameters,
        )
      ) {
        return;
      }

      _setOverriddenBlock(value);
    },
    [
      overriddenBlock?.blockContent.blockText,
      overriddenBlock?.blockContent.symbolId,
      overriddenBlock?.blockContent.blockParameters,
      overriddenBlock?.layerId,
    ],
  );

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

  useEffect(() => {
    if (isPlayground) return;

    const subscriptions = layers
      .filter(Layers.isSymbolInstance)
      .flatMap((layer) =>
        resolveLayer({
          layer,
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
  }, [dispatch, isPlayground, layers, setToastDataDebounced]);

  const InteractiveRenderer =
    canvasRendererType === 'canvas' ? CanvasKitRenderer : SVGRenderer;

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
                  {layers.map((layer) => (
                    <Widget
                      key={layer.do_objectID}
                      layer={layer}
                      showToolbar={!isPlayground}
                      setOverriddenBlock={(blockContent) => {
                        if (blockContent) {
                          setOverriddenBlock({
                            layerId: layer.do_objectID,
                            blockContent,
                          });
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
                        const nextBlock =
                          Blocks[content.symbolId ?? layer.symbolID];

                        const contentWithNormalizedText: BlockContent = {
                          ...content,
                          normalizedText: parseBlock(
                            content.blockText,
                            nextBlock.parser,
                            { placeholder: nextBlock.placeholderText },
                          ).content,
                        };

                        dispatch('batch', [
                          [
                            'setBlockContent',
                            layer.do_objectID,
                            contentWithNormalizedText,
                          ],
                          ...(contentWithNormalizedText.blockText !== ''
                            ? [
                                [
                                  'setSymbolIdIsFixed',
                                  layer.do_objectID,
                                  true,
                                ] as Action,
                              ]
                            : []),
                        ]);
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
            overriddenBlock={overriddenBlock}
            resizeBehavior="match-canvas"
            designSystem={designSystem}
            sync={!isPlayground}
          />
        </Overlay>
        {viewType === 'combined' && (
          <>
            {!isPlayground && (
              <AyonInspector setOverriddenBlock={setOverriddenBlock} />
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
