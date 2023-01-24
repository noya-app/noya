import { SearchIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Spacer,
  Spinner,
  Switch,
  SystemProps,
  Text,
  theme,
  VStack,
} from '@chakra-ui/react';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  createRect,
  createResizeTransform,
  Rect,
  Size,
  transformRect,
} from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import React, { useEffect, useRef } from 'react';
import {
  avatarSymbol,
  boxSymbol,
  buttonSymbol,
  checkboxSymbol,
  headerBarNavUserSymbol,
  heading1Symbol,
  heading2Symbol,
  heading3Symbol,
  heading4Symbol,
  heading5Symbol,
  heading6Symbol,
  heroSymbol,
  iconButtonSymbol,
  imageSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
  writeSymbol,
} from './symbols';

type DOMElementsProps = {
  frame: Rect;
  blockText?: string;
  resolvedBlockData?: Sketch.SymbolInstance['resolvedBlockData'];
};

export function filterHashTags(text?: string): {
  content?: string;
  hashTags?: string[];
} {
  const lines = text?.split(/\r?\n/);
  const words = lines?.map((line) => line.split(' ')).flat();
  const content = words?.filter((word) => !word.startsWith('#')).join(' ');
  const hashTags = words
    ?.filter((word) => word.startsWith('#'))
    .map((word) => word.slice(1).trim());
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
  textAlign?: SystemProps['textAlign'];
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
  const textAlign = hashTags?.find((hashTag) =>
    ['left', 'center', 'right'].includes(hashTag),
  ) as SystemProps['textAlign'];
  return {
    content,
    hashTags,
    color,
    colorScheme,
    fontWeight,
    fontSize,
    align,
    textAlign,
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
  [writeSymbol.symbolID]: (props: DOMElementsProps) => {
    const { color, fontWeight, fontSize, align } = filterTextPropertyHashTags(
      props.blockText,
    );
    return (
      <Text
        color={color}
        fontWeight={fontWeight}
        fontSize={fontSize}
        align={align as SystemProps['textAlign']}
      >
        {props.resolvedBlockData?.resolvedText ?? (
          <Flex align="center">
            {props.blockText && (
              <>
                <Spinner
                  thickness="3px"
                  color="gray"
                  size={fontSize}
                  speed="1.5s"
                />
                <span style={{ marginLeft: 10 }}>Thinking...</span>
              </>
            )}
            {!props.blockText && 'Waiting for input...'}
          </Flex>
        )}
      </Text>
    );
  },
  [headerBarNavUserSymbol.symbolID]: (props: DOMElementsProps) => {
    const { content, hashTags } = filterHashTags(props.blockText);
    const backgroundColor = hashTags?.includes('dark')
      ? 'rgba(11,21,48,0.9)'
      : 'rgba(255,255,255,0.9)';
    const borderBottomColor = hashTags?.includes('dark')
      ? 'transparent'
      : '#eee';
    const searchBackgroundColor = hashTags?.includes('dark')
      ? 'rgba(0,0,0,0.2)'
      : 'rgba(0,0,0,0.02)';
    const color = hashTags?.includes('dark') ? '#fff' : '#000';
    const links = content
      ? content.split(',').map((link) => link.trim())
      : ['*Home', 'Projects', 'Team', 'FAQ'];
    if (links.filter((link) => link[0] === '*').length === 0) {
      links[0] = `*${links[0]}`;
    }
    return (
      <Flex
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor={borderBottomColor}
        height={`${props.frame.height}px`}
        paddingX="10px"
        backgroundColor={backgroundColor}
        backdropFilter="auto"
        backdropBlur="10px"
      >
        {links.map((link, index) => {
          let backgroundColor = 'transparent';
          if (link[0] === '*') {
            backgroundColor = hashTags?.includes('dark')
              ? 'rgba(0,0,0,0.5)'
              : 'rgba(0,0,0,0.1)';
          }
          const [, linkText] = /^\*?(.*)/.exec(link) || [];
          return (
            <Link
              marginX="10px"
              padding="5px 10px"
              borderRadius="3px"
              fontSize="12px"
              fontWeight="medium"
              backgroundColor={backgroundColor}
              color={color}
            >
              {linkText}
            </Link>
          );
        })}
        <Spacer />
        {hashTags?.includes('search') && (
          <InputGroup
            flex="0.35"
            marginX="10px"
            size="sm"
            borderColor="rgba(0,0,0,0.1)"
            backgroundColor={searchBackgroundColor}
          >
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color={color} />}
            />
            <Input placeholder="Search" />
          </InputGroup>
        )}
        <Avatar size={props.frame.height < 60 ? 'xs' : 'sm'} marginX="10px" />
      </Flex>
    );
  },
  [heroSymbol.symbolID]: (props: DOMElementsProps) => {
    const { align, textAlign } = filterTextPropertyHashTags(props.blockText);
    const blockText = props.blockText
      ? props.blockText.split(/\n/)
      : [
          'Create, iterate, inspire.',
          'Turn great ideas into new possibilities.',
          'Get started',
          'Learn more',
        ];

    let headline,
      subheadline,
      button,
      button2,
      defaultHeadlineSize = 'xl',
      defaultSubheadlineSize = 'md',
      defaultButtonSize = 'sm',
      defaultSpacing = 2;

    if (props.frame.width > 800 && props.frame.height > 370) {
      defaultHeadlineSize = '3xl';
      defaultSubheadlineSize = '2xl';
      defaultButtonSize = 'lg';
      defaultSpacing = 4;
    } else if (props.frame.width > 500 && props.frame.height > 270) {
      defaultHeadlineSize = '2xl';
      defaultSubheadlineSize = 'lg';
      defaultButtonSize = 'md';
      defaultSpacing = 3;
    }

    if (blockText[0]) {
      headline = filterTextPropertyHashTags(blockText[0]);
    }

    if (blockText[1]) {
      subheadline = filterTextPropertyHashTags(blockText[1]);
    }

    if (blockText[2]) {
      button = filterTextPropertyHashTags(blockText[2]);
    }

    if (blockText[3]) {
      button2 = filterTextPropertyHashTags(blockText[3]);
    }
    return (
      <Flex
        flexDirection="column"
        height="100%"
        justifyContent="center"
        paddingX={8}
      >
        <VStack align={align ?? 'center'} spacing={defaultSpacing}>
          {headline && (
            <Heading
              size={defaultHeadlineSize}
              color={headline.color}
              fontWeight={headline.fontWeight}
              fontSize={headline.fontSize}
              textAlign={textAlign ?? 'center'}
            >
              {headline.content}
            </Heading>
          )}
          {subheadline && (
            <Text
              color={subheadline.color}
              fontWeight={subheadline.fontWeight}
              fontSize={defaultSubheadlineSize ?? subheadline.fontSize}
              textAlign={textAlign ?? 'center'}
            >
              {subheadline.content}
            </Text>
          )}
          <HStack
            paddingTop={defaultSpacing * 2}
            spacing={4}
            justifyContent={align}
          >
            {button && (
              <Button
                size={defaultButtonSize}
                colorScheme={button.colorScheme ?? 'green'}
                fontWeight={button.fontWeight}
                fontSize={button.fontSize}
                alignSelf="flex-start"
              >
                {button.content}
              </Button>
            )}
            {button2 && (
              <Button
                size={defaultButtonSize}
                colorScheme={button2.colorScheme}
                fontWeight={button2.fontWeight}
                fontSize={button2.fontSize}
                alignSelf="flex-start"
              >
                {button2.content}
              </Button>
            )}
          </HStack>
        </VStack>
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

function DOMRendererContent({
  size,
  resizeBehavior,
}: {
  size: Size;
  resizeBehavior: ResizeBehavior;
}): JSX.Element {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;
  const rect = Selectors.getBoundingRect(page, [artboard.do_objectID])!;

  const containerTransform = createResizeTransform(artboard.frame, size, {
    scalingMode: 'down',
    resizePosition: 'top',
    padding: 20,
  });
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const transform =
    resizeBehavior === 'match-canvas' ? canvasTransform : containerTransform;

  const paddedRect = transformRect(rect, transform);

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
    </ChakraProvider>
  );
}

type ResizeBehavior = 'match-canvas' | 'fit-container';

export function DOMRenderer({
  resizeBehavior,
}: {
  resizeBehavior: ResizeBehavior;
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        {size && (
          <DOMRendererContent size={size} resizeBehavior={resizeBehavior} />
        )}
      </div>
    </div>
  );
}
