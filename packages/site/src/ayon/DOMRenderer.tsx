import React from 'react';
import {
  Avatar,
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  Heading,
  IconButton,
  Image,
  Input,
  Switch,
  Text,
} from '@chakra-ui/react';
import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { createRect, Rect } from 'noya-geometry';
import { Layers, Selectors } from 'noya-state';
import {
  avatarSymbol,
  boxSymbol,
  buttonSymbol,
  checkboxSymbol,
  heading1Symbol,
  heading2Symbol,
  heading3Symbol,
  heading4Symbol,
  heading5Symbol,
  heading6Symbol,
  iconButtonSymbol,
  imageSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
} from './symbols';

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
  [boxSymbol.symbolID]: (props: DOMElementsProps) => (
    <Box
      bg={
        props.blockText && CSS.supports('color', props.blockText)
          ? props.blockText
          : '#eee'
      }
      w="100%"
      h="100%"
    />
  ),
  [checkboxSymbol.symbolID]: (props: DOMElementsProps) => <Checkbox />,
  [iconButtonSymbol.symbolID]: (props: DOMElementsProps) => (
    <IconButton aria-label={''} />
  ),
  [inputSymbol.symbolID]: (props: DOMElementsProps) => <Input />,
  [switchSymbol.symbolID]: (props: DOMElementsProps) => <Switch />,
  [textSymbol.symbolID]: (props: DOMElementsProps) => (
    <Text>{props.blockText}</Text>
  ),
  [imageSymbol.symbolID]: (props: DOMElementsProps) => (
    <Image
      src={`https://source.unsplash.com/${props.frame.width}x${props.frame.height}?${props.blockText}`}
      fit="cover"
      align="middle"
      w="100%"
      h="100%"
    />
  ),
  [heading1Symbol.symbolID]: (props: DOMElementsProps) => (
    <Heading size="2xl">{props.blockText}</Heading>
  ),
  [heading2Symbol.symbolID]: (props: DOMElementsProps) => (
    <Heading size="xl">{props.blockText}</Heading>
  ),
  [heading3Symbol.symbolID]: (props: DOMElementsProps) => (
    <Heading size="lg">{props.blockText}</Heading>
  ),
  [heading4Symbol.symbolID]: (props: DOMElementsProps) => (
    <Heading size="md">{props.blockText}</Heading>
  ),
  [heading5Symbol.symbolID]: (props: DOMElementsProps) => (
    <Heading size="sm">{props.blockText}</Heading>
  ),
  [heading6Symbol.symbolID]: (props: DOMElementsProps) => (
    <Heading size="xs">{props.blockText}</Heading>
  ),
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
