import { Heading, Link, VStack } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { isWithinRectRange } from './score';
import { sidebarSymbol, sidebarSymbolId } from './symbols';
import { getBlockClassName, getTailwindClasses } from './tailwind';

const placeholderText = `
*Dashboard 
Updates
Billing
Settings
`.trim();

const globalHashtags = ['dark', 'title', ...getTailwindClasses()];

export const SidebarBlock: BlockDefinition = {
  id: sidebarSymbolId,
  globalHashtags,
  placeholderText,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === sidebarSymbol.symbolID)
    ) {
      return 0;
    }

    return Math.max(isWithinRectRange(frame, 200, 400, 360, 2000) ? 1 : 0, 0.1);
  },
  render: (props) => {
    const {
      items,
      globalParameters: { dark, title, ...globalParameters },
    } = parseBlock(props.blockText, 'newlineSeparated', {
      placeholder: placeholderText,
    });

    const hashTags = Object.keys(globalParameters);
    const hasActiveItem = items.some((item) => item.parameters.active);

    const backgroundColor = dark
      ? 'rgba(11,21,48,0.85)'
      : 'rgba(240,240,240,0.85)';
    const color = dark ? '#fff' : '#000';

    const hasTailwindBackground = hashTags.some((value) =>
      value.startsWith('bg-'),
    );
    const hasTailwindColor = hashTags.some((value) =>
      value.startsWith('text-'),
    );

    return (
      <VStack
        alignItems="left"
        height={`${props.frame.height}px`}
        spacing="5px"
        paddingY="10px"
        paddingX="10px"
        backgroundColor={hasTailwindBackground ? undefined : backgroundColor}
        backdropFilter="auto"
        backdropBlur="10px"
        className={getBlockClassName(hashTags)}
      >
        {items.map(({ content, parameters: { active } }, index) => {
          let backgroundColor = 'transparent';
          let fontWeight = 'normal';

          if (active || (!hasActiveItem && index === 0)) {
            backgroundColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)';
            fontWeight = 'medium';
          }

          if (title && index === 0) {
            return (
              <Heading
                color={hasTailwindColor ? undefined : color}
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
              color={hasTailwindColor ? undefined : color}
            >
              {content}
            </Link>
          );
        })}
      </VStack>
    );
  },
};
