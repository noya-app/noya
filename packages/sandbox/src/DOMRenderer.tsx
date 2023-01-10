import { Avatar, Button, ChakraProvider } from '@chakra-ui/react';
import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { createRect, Rect } from 'noya-geometry';
import { Layers, Selectors } from 'noya-state';
import * as React from 'react';
import { avatarSymbol, buttonSymbol } from './symbols';

type DOMElementsProps = {
  frame: Rect;
  blockText?: string;
};

export const symbolIdToElement = {
  [buttonSymbol.symbolID]: (props: DOMElementsProps) => {
    let size;
    if (props.frame.height < 30) {
      size = 'xs' as const;
    } else if (props.frame.height > 50) {
      size = 'lg' as const;
    } else {
      size = 'md' as const;
    }
    return (
      <Button size={size} isFullWidth>
        {props.blockText}
      </Button>
    );
  },
  [avatarSymbol.symbolID]: (props: DOMElementsProps) => <Avatar size="full" />,
};

function SymbolRenderer({
  frame,
  symbolId,
  blockText,
}: { symbolId: string } & DOMElementsProps) {
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
      {symbolIdToElement[symbolId]({ frame, blockText })}
    </div>
  );
}

export function DOMRenderer(): JSX.Element {
  const [state] = useApplicationState();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;

  return (
    <div style={{ position: 'relative', background: '#f9f9f9', flex: '1' }}>
      <ChakraProvider>
        <div
          style={{
            position: 'absolute',
            width: artboard.frame.width,
            height: artboard.frame.height,
            backgroundColor: '#fff',
            borderRight: '1px solid #ccc',
            borderBottom: '1px solid #ccc',
          }}
        >
          {artboard.layers.filter(Layers.isSymbolInstance).map((layer) => (
            <SymbolRenderer
              key={layer.do_objectID}
              frame={layer.frame}
              symbolId={layer.symbolID}
              blockText={layer.blockText}
            />
          ))}
          {state.interactionState.type === 'drawing' && (
            <SymbolRenderer
              key="drawing"
              frame={createRect(
                state.interactionState.origin,
                state.interactionState.current,
              )}
              symbolId={
                typeof state.interactionState.shapeType === 'string'
                  ? buttonSymbol.symbolID
                  : state.interactionState.shapeType.symbolId
              }
            />
          )}
        </div>
      </ChakraProvider>
    </div>
  );
}
