import { Avatar, Button, ChakraProvider } from '@chakra-ui/react';
import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { Layers, Selectors } from 'noya-state';
import * as React from 'react';
import { avatarSymbol, buttonSymbol } from './symbols';

export const symbolIdToElement = {
  [buttonSymbol.symbolID]: (layer: Sketch.SymbolInstance) => {
    let size;
    if (layer.frame.height < 30) {
      size = 'xs' as const;
    } else if (layer.frame.height > 50) {
      size = 'lg' as const;
    } else {
      size = 'md' as const;
    }
    return (
      <Button size={size} isFullWidth>
        {layer.blockText}
      </Button>
    );
  },
  [avatarSymbol.symbolID]: (layer: Sketch.SymbolInstance) => (
    <Avatar size="full" />
  ),
};

export function DOMRenderer(): JSX.Element {
  const [state] = useApplicationState();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;
  return (
    <div style={{ position: 'relative' }}>
      <ChakraProvider>
        {artboard.layers.map((layer) => {
          return (
            <div
              key={layer.do_objectID}
              style={{
                position: 'absolute',
                left: layer.frame.x,
                top: layer.frame.y,
                width: layer.frame.width,
                height: layer.frame.height,
              }}
            >
              {Layers.isSymbolInstance(layer) &&
                typeof symbolIdToElement[layer.symbolID] === 'function' &&
                symbolIdToElement[layer.symbolID](layer)}
            </div>
          );
        })}
      </ChakraProvider>
    </div>
  );
}
