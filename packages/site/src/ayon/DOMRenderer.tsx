import { ChakraProvider } from '@chakra-ui/react';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  createResizeTransform,
  Rect,
  Size,
  transformRect,
} from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { BlockProps, Layers, Selectors } from 'noya-state';
import React, { ComponentProps, useRef } from 'react';
import { Blocks } from './blocks/blocks';
import { buttonSymbol } from './blocks/symbols';

function SymbolRenderer({
  layer,
  dataSet,
  frame,
  symbolId,
  blockText,
  resolvedBlockData,
  getBlock,
}: BlockProps & { frame: Rect; symbolId: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
      }}
    >
      {getBlock(symbolId).render({
        layer,
        dataSet,
        symbolId,
        frame,
        blockText,
        resolvedBlockData,
        getBlock,
      })}
    </div>
  );
}

function DOMRendererContent({
  size,
  resizeBehavior,
  padding = 0,
}: {
  size: Size;
  resizeBehavior: ResizeBehavior;
  padding?: number;
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

  const getBlock = (symbolId: string) => Blocks[symbolId];

  return (
    <ChakraProvider>
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
        {artboard.layers.filter(Layers.isSymbolInstance).map((layer) => (
          <SymbolRenderer
            layer={layer}
            dataSet={{
              id: layer.do_objectID,
              parentId: layer.do_objectID,
            }}
            key={layer.do_objectID}
            frame={layer.frame}
            symbolId={layer.symbolID}
            blockText={layer.blockText}
            resolvedBlockData={layer.resolvedBlockData}
            getBlock={getBlock}
          />
        ))}
        {state.interactionState.type === 'drawing' && (
          <SymbolRenderer
            key="drawing"
            frame={Selectors.getDrawnLayerRect(
              state.interactionState.origin,
              state.interactionState.current,
              state.interactionState.options,
            )}
            symbolId={
              typeof state.interactionState.shapeType === 'string'
                ? buttonSymbol.symbolID
                : state.interactionState.shapeType.symbolId
            }
            getBlock={getBlock}
          />
        )}
      </div>
    </ChakraProvider>
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
