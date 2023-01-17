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
import { createRect, Rect, Size } from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { createResizeTransform } from 'noya-renderer';
import { Layers, Selectors } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import React, { useEffect, useRef } from 'react';
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
  resolvedBlockData?: Sketch.SymbolInstance['resolvedBlockData'];
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
  [boxSymbol.symbolID]: (props: DOMElementsProps) => {
    const { content, hashTags } = filterHashTags(props.blockText);
    const color =
      [content]
        .concat(hashTags)
        .find((value) => CSS.supports('color', `${value}`)) ?? '#ebfdff';
    return <Box bg={color} w="100%" h="100%" />;
  },
  [checkboxSymbol.symbolID]: (props: DOMElementsProps) => <Checkbox />,
  [iconButtonSymbol.symbolID]: (props: DOMElementsProps) => (
    <IconButton aria-label={''} />
  ),
  [inputSymbol.symbolID]: (props: DOMElementsProps) => {
    const [value, setValue] = React.useState(props.blockText ?? '');

    useEffect(() => {
      setValue(props.blockText ?? '');
    }, [props.blockText]);

    return (
      <Input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
    );
  },
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
      src={
        props.blockText && isExternalUrl(props.blockText)
          ? props.blockText
          : props.resolvedBlockData?.resolvedText
      }
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
  resolvedBlockData,
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
      {symbolIdToElement[symbolId]({ frame, blockText, resolvedBlockData })}
    </div>
  );
}

function DOMRendererContent({ size }: { size: Size }): JSX.Element {
  const [state] = useApplicationState();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;

  const { transform, paddedRect } = createResizeTransform({
    containerSize: size,
    contentRect: artboard.frame,
    scalingMode: 'upOrDown',
  });

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
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: artboard.frame.x,
            top: artboard.frame.y,
            width: artboard.frame.width,
            height: artboard.frame.height,
            backgroundColor: '#fff',
          }}
        >
          {artboard.layers.filter(Layers.isSymbolInstance).map((layer) => (
            <SymbolRenderer
              key={layer.do_objectID}
              frame={layer.frame}
              symbolId={layer.symbolID}
              blockText={layer.blockText}
              resolvedBlockData={layer.resolvedBlockData}
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
      </div>
    </ChakraProvider>
  );
}

export function DOMRenderer(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);
  const [state] = useApplicationState();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;
  const ratio = artboard.frame.width / artboard.frame.height;

  return (
    <div style={{ display: 'flex', flex: 1, padding: 20 }}>
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        {size && (
          <DOMRendererContent
            size={{
              width: size.width,
              height: size.width / ratio,
            }}
          />
        )}
      </div>
    </div>
  );
}
