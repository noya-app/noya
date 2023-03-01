import { Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { getTextAlign, parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { isWithinRectRange } from './score';
import { heroSymbol } from './symbols';

const placeholderText = `
Create, iterate, inspire.
Turn great ideas into new possibilities.
Get started
Learn more
`.trim();

const parser = 'newlineSeparated';

export const HeroBlockV1: BlockDefinition = {
  symbol: heroSymbol,
  parser,
  hashtags: ['left', 'right', 'center', 'dark', 'accent'],
  placeholderText,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.find((block) => block.symbolId === heroSymbol.symbolID)) {
      return 0;
    }

    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 400,
        minHeight: 200,
        maxWidth: 2000,
        maxHeight: 550,
      }) && frame.y < 180
        ? 1
        : 0,
      0.1,
    );
  },
  render: (props) => {
    const {
      items,
      parameters: { dark, accent, ...parameters },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const { backgroundColor, color } = getBlockThemeColors({ dark, accent });

    const hashtags = Object.keys(parameters);
    const textAlign = getTextAlign(hashtags) ?? 'center';

    const [headline, subheadline, button, button2] = items.map(
      (item) => item.content,
    );

    let headlineSize = 'xl';
    let subheadlineSize = 'md';
    let buttonSize = 'sm';
    let spacing = 2;

    const height = props.frame?.height ?? 500;
    const width = props.frame?.width ?? 350;

    if (width > 800 && height > 370) {
      headlineSize = '3xl';
      subheadlineSize = '2xl';
      buttonSize = 'lg';
      spacing = 4;
    } else if (width > 500 && height > 270) {
      headlineSize = '2xl';
      subheadlineSize = 'lg';
      buttonSize = 'md';
      spacing = 3;
    }

    return (
      <Flex
        flexDirection="column"
        height="100%"
        justifyContent="center"
        paddingX={20}
        backgroundColor={dark || accent ? backgroundColor : undefined}
        color={color}
      >
        <VStack spacing={spacing} align={textAlign}>
          {headline && (
            <Heading size={headlineSize} textAlign={textAlign}>
              {headline}
            </Heading>
          )}
          {subheadline && (
            <Text fontSize={subheadlineSize} textAlign={textAlign}>
              {subheadline}
            </Text>
          )}
          <HStack
            paddingTop={spacing * 2}
            spacing={4}
            justifyContent={textAlign}
          >
            {button && (
              <Button
                size={buttonSize}
                colorScheme="green"
                alignSelf="flex-start"
              >
                {button}
              </Button>
            )}
            {button2 && (
              <Button
                size={buttonSize}
                alignSelf="flex-start"
                color={dark ? 'rgba(0,0,0,0.8)' : undefined}
              >
                {button2}
              </Button>
            )}
          </HStack>
        </VStack>
      </Flex>
    );
  },
};
