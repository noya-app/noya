import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  CanvasKitRenderer,
  convertPoint,
  Interactions,
  SimpleCanvas,
} from 'noya-canvas';
import { roundPoint } from 'noya-geometry';
import { FileDropTarget, OffsetPoint } from 'noya-react-utils';
import { Design, RenderingModeProvider, useCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import { isExternalUrl } from 'noya-utils';
import React, { memo, useEffect, useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import styled from 'styled-components';
import { DOMRenderer } from './DOMRenderer';
import { inferBlockType, inferBlockTypes } from './inferBlock';
import { Panel } from './Panel';
import { RedirectResolver } from './RedirectResolver';
import { Stacking } from './stacking';
import { buttonSymbol, imageSymbolId } from './symbols';
import { DrawingWidget, Widget } from './Widget';

const Overlay = styled.div({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

const redirectResolver = new RedirectResolver();

export const Content = memo(function Content({
  uploadAsset,
}: {
  uploadAsset: (file: ArrayBuffer) => Promise<string>;
}) {
  const { canvasSize, isContextMenuOpen } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const layers = Layers.flat(Selectors.getCurrentPage(state)).filter(
    Layers.isSymbolInstance,
  );
  const panelRef = useRef<ImperativePanelHandle>(null);
  const CanvasKit = useCanvasKit();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;

  const addImageFiles = async (files: File[], offsetPoint: OffsetPoint) => {
    const images = await Promise.all(
      files.map(async (file) => {
        const data = await file.arrayBuffer();
        const image = CanvasKit.MakeImageFromEncoded(data);
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

    dispatch('addLayer', layers, point);
  };

  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    layers.forEach((layer) => {
      const {
        blockText,
        resolvedBlockData,
        frame,
        symbolID,
        do_objectID: layerId,
      } = layer;

      if (typeof blockText !== 'string') return;

      // Already resolved
      if (resolvedBlockData && resolvedBlockData.originalText === blockText) {
        return;
      }

      if (symbolID === imageSymbolId && !isExternalUrl(blockText)) {
        const unsplashUrl = `https://source.unsplash.com/${frame.width}x${frame.height}?${blockText}`;

        redirectResolver.resolve(layerId, unsplashUrl);

        subscriptions.push(
          redirectResolver.addListener(layerId, unsplashUrl, (resolvedUrl) => {
            dispatch('setResolvedBlockData', layerId, {
              originalText: blockText,
              resolvedText: resolvedUrl,
              symbolID: symbolID,
            });
          }),
        );
      }
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [dispatch, layers]);

  return (
    <Panel.Root direction="horizontal" autoSaveId="ayon-canvas">
      <Panel.Item ref={panelRef} collapsible defaultSize={75}>
        <FileDropTarget
          supportedFileTypes={[
            'image/png' as const,
            'image/jpeg' as const,
            'image/webp' as const,
          ]}
          onDropFiles={addImageFiles}
        >
          <SimpleCanvas
            interactions={[
              Interactions.duplicate,
              Interactions.reorder,
              Interactions.zoom,
              Interactions.escape,
              Interactions.history,
              Interactions.clipboard,
              Interactions.editText,
              Interactions.editBlock,
              Interactions.focus,
              Interactions.pan,
              Interactions.createScale({ inferBlockType }),
              Interactions.createInsertMode({ inferBlockType }),
              Interactions.selection,
              Interactions.move,
              Interactions.createDrawing({
                allowDrawingFromNoneState: true,
                inferBlockType,
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
                        'setSymbolInstanceSource',
                        typeof type !== 'string'
                          ? type.symbolId
                          : buttonSymbol.symbolID,
                        'preserveCurrent',
                      );
                    }}
                    uploadAsset={uploadAsset}
                  />
                ))}
                {state.interactionState.type === 'drawing' && (
                  <DrawingWidget inferBlockType={inferBlockType} />
                )}
              </>
            }
          >
            {({ size }) => (
              <>
                <CanvasKitRenderer size={size}>
                  <RenderingModeProvider value="interactive">
                    <Design.Root>
                      <Design.Background />
                      <Design.Page />
                      <Design.PixelGrid />
                      <Design.Marquee />
                      <Design.GradientEditor />
                      <Design.InsertSymbol />
                      <Design.DrawPath />
                      <Design.EditPath />
                    </Design.Root>
                  </RenderingModeProvider>
                </CanvasKitRenderer>
              </>
            )}
          </SimpleCanvas>
        </FileDropTarget>

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
                <Design.SnapGuides />
                <Design.MeasurementGuides />
                <Design.DragHandles />
              </Design.Root>
            </RenderingModeProvider>
          </SVGRenderer>
        </Overlay>
      </Panel.Item>
      <Panel.Handle onDoubleClick={() => panelRef.current?.resize(50)} />
      <Panel.Item collapsible>
        <DOMRenderer />
      </Panel.Item>
    </Panel.Root>
  );
});
