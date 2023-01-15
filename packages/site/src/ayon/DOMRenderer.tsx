import React from 'react';
import {
  Avatar,
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Image,
  Input,
  Switch,
  SystemProps,
  Text,
  theme,
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

function filterHashTags(text?: string): {
  content?: string;
  hashTags?: string[];
} {
  const words = text?.split(' ');
  const content = words?.filter((word) => !word.startsWith('#')).join(' ');
  const hashTags = words
    ?.filter((word) => word.startsWith('#'))
    .map((word) => word.slice(1));
  return {
    content,
    hashTags,
  };
}

function filterTextPropertyHashTags(text?: string): {
  content?: string;
  hashTags?: string[];
  color?: string;
  colorScheme?: string;
  fontWeight?: string;
  fontSize?: string;
  align?: string;
} {
  const { content, hashTags } = filterHashTags(text);
  const colorByHashTag = hashTags?.find((hashTag) =>
    CSS.supports('color', hashTag),
  );
  const colorByHashTagHex = hashTags
    ?.map((hashTag) => `#${hashTag}`)
    .find((hashTag) => CSS.supports('color', hashTag));
  const color = colorByHashTag ?? colorByHashTagHex;
  const colorScheme = hashTags?.find((hashTag) =>
    Object.keys(theme.colors).includes(hashTag),
  );
  const fontWeight = hashTags?.find((hashTag) =>
    Object.keys(theme.fontWeights).includes(hashTag),
  );
  const fontSize = hashTags?.find((hashTag) =>
    Object.keys(theme.fontSizes).includes(hashTag),
  );
  const align = hashTags?.find((hashTag) =>
    ['left', 'center', 'right'].includes(hashTag),
  );
  return {
    content,
    hashTags,
    color,
    colorScheme,
    fontWeight,
    fontSize,
    align,
  };
}

export const symbolIdToElement = {
  [buttonSymbol.symbolID]: (props: DOMElementsProps) => {
    const { content, colorScheme, fontWeight, fontSize } =
      filterTextPropertyHashTags(props.blockText);
    let size;
    if (props.frame.height < 30) {
      size = 'xs' as const;
    } else if (props.frame.height > 50) {
      size = 'lg' as const;
    } else {
      size = 'md' as const;
    }
    return (
      <Button
        colorScheme={colorScheme}
        fontWeight={fontWeight}
        fontSize={fontSize}
        size={size}
        isFullWidth
      >
        {content}
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
  [textSymbol.symbolID]: (props: DOMElementsProps) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Text
        color={color}
        fontWeight={fontWeight}
        fontSize={fontSize}
        align={align as SystemProps['textAlign']}
      >
        {content}
      </Text>
    );
  },
  [imageSymbol.symbolID]: (props: DOMElementsProps) => (
    <Image
      src={`https://source.unsplash.com/${props.frame.width}x${props.frame.height}?${props.blockText}`}
      fit="cover"
      align="middle"
      w="100%"
      h="100%"
    />
  ),
  [heading1Symbol.symbolID]: (props: DOMElementsProps) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Flex justify={align}>
        <Heading
          size="2xl"
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {content}
        </Heading>
      </Flex>
    );
  },
  [heading2Symbol.symbolID]: (props: DOMElementsProps) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Flex justify={align}>
        <Heading
          size="xl"
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {content}
        </Heading>
      </Flex>
    );
  },
  [heading3Symbol.symbolID]: (props: DOMElementsProps) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Flex justify={align}>
        <Heading
          size="lg"
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {content}
        </Heading>
      </Flex>
    );
  },
  [heading4Symbol.symbolID]: (props: DOMElementsProps) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Flex justify={align}>
        <Heading
          size="md"
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {content}
        </Heading>
      </Flex>
    );
  },
  [heading5Symbol.symbolID]: (props: DOMElementsProps) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Flex justify={align}>
        <Heading
          size="sm"
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {content}
        </Heading>
      </Flex>
    );
  },
  [heading6Symbol.symbolID]: (props: DOMElementsProps) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Flex justify={align}>
        <Heading
          size="xs"
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {content}
        </Heading>
      </Flex>
    );
  },
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
