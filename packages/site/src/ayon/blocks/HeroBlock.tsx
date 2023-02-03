import { Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { isWithinRectRange } from './score';
import { heroSymbol, heroSymbolId } from './symbols';
import { getBlockClassName, getTailwindClasses } from './tailwind';

const placeholderText = `
Create, iterate, inspire.
Turn great ideas into new possibilities.
Get started
Learn more
`.trim();

export const HeroBlock: BlockDefinition = {
  id: heroSymbolId,
  globalHashtags: getTailwindClasses(),
  placeholderText,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.find((block) => block.symbolId === heroSymbol.symbolID)) {
      return 0;
    }

    return Math.max(
      isWithinRectRange(frame, 400, 200, 2000, 550) && frame.y < 180 ? 1 : 0,
      0.1,
    );
  },
  render: (props) => {
    const { align, textAlign, hashTags } = filterTextPropertyHashTags(
      props.blockText,
    );
    const blockText = (props.blockText || placeholderText).split(/\r?\n/);

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
        className={getBlockClassName(hashTags)}
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
