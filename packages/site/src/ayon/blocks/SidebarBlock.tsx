import { Heading, Link, VStack } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { isWithinRectRange } from './score';
import { sidebarSymbol } from './symbols';

const placeholderText = `
*Dashboard 
Updates
Billing
Settings
`.trim();

const globalHashtags = ['dark', 'accent', 'title'];

const parser = 'newlineSeparated';

export const SidebarBlock: BlockDefinition = {
  symbol: sidebarSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === sidebarSymbol.symbolID)
    ) {
      return 0;
    }

    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 120,
        minHeight: 300,
        maxWidth: 240,
        maxHeight: 2000,
      })
        ? 1
        : 0,
      0.1,
    );
  },
  render: (props) => {
    const {
      items,
      parameters: { dark, accent, title },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hasActiveItem = items.some((item) => item.parameters.active);

    const { backgroundColor, color, activeLinkBackgroundColor } =
      getBlockThemeColors({ dark, accent });

    return (
      <VStack
        alignItems="left"
        height={'100%'}
        spacing="5px"
        paddingY="10px"
        paddingX="10px"
        backgroundColor={backgroundColor}
        backdropFilter="auto"
        backdropBlur="10px"
      >
        {items.map(({ content, parameters: { active } }, index) => {
          let backgroundColor = 'transparent';
          let fontWeight = 'normal';

          if (active || (!hasActiveItem && index === 0)) {
            backgroundColor = activeLinkBackgroundColor;
            fontWeight = 'medium';
          }

          if (title && index === 0) {
            return (
              <Heading
                color={color}
                fontWeight="semibold"
                size="md"
                padding="12px 10px"
              >
                {content}
              </Heading>
            );
          }

          return (
            <Link
              padding="8px 10px"
              borderRadius="3px"
              fontSize="12px"
              fontWeight={fontWeight}
              backgroundColor={backgroundColor}
              color={color}
            >
              {content}
            </Link>
          );
        })}
      </VStack>
    );
  },
};
