import { Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { isWithinRectRange, scoreCommandMatch } from './score';
import { heroSymbol, heroSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const HeroBlock: BlockDefinition = {
  id: heroSymbolId,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.find((block) => block.symbolId === heroSymbol.symbolID)) {
      return 0;
    }

    return Math.max(
      scoreCommandMatch(heroSymbol.name, blockText),
      isWithinRectRange(frame, 400, 200, 2000, 550) && frame.y < 180 ? 1 : 0,
      0.1,
    );
  },
  render: (props) => {
    const { align, textAlign } = filterTextPropertyHashTags(props.blockText);
    const blockText = props.blockText
      ? props.blockText.split(/\r?\n/)
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
