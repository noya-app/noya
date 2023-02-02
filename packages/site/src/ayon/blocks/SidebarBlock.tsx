import { Heading, Link, VStack } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterHashTagsAndSlashCommands } from '../parse';
import { isWithinRectRange } from './score';
import { sidebarSymbol, sidebarSymbolId } from './symbols';
import { getBlockClassName } from './tailwind';

export const SidebarBlock: BlockDefinition = {
  id: sidebarSymbolId,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === sidebarSymbol.symbolID)
    ) {
      return 0;
    }

    return Math.max(isWithinRectRange(frame, 200, 400, 360, 2000) ? 1 : 0, 0.1);
  },
  render: (props) => {
    const { hashTags } = filterHashTagsAndSlashCommands(props.blockText);
    const backgroundColor = hashTags?.includes('dark')
      ? 'rgba(11,21,48,0.85)'
      : 'rgba(240,240,240,0.85)';
    const color = hashTags.includes('dark') ? '#fff' : '#000';
    let links = props.blockText
      ?.split(/\r?\n/)
      .map((link) => filterHashTagsAndSlashCommands(link).content.trim());
    if (!links || links.join('') === '') {
      links = ['*Dashboard', 'Updates', 'Billing', 'Settings'];
    }
    if (links.filter((link) => link[0] === '*').length === 0) {
      links[0] = `*${links[0]}`;
    }
    const hasTitle = hashTags.includes('title');

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
        {links.map((link, index) => {
          let backgroundColor = 'transparent';
          let fontWeight = 'normal';
          if (link[0] === '*') {
            backgroundColor = hashTags?.includes('dark')
              ? 'rgba(0,0,0,0.5)'
              : 'rgba(0,0,0,0.1)';
            fontWeight = 'medium';
          }
          const [, linkText] = /^\*?(.*)/.exec(link) || [];

          if (hasTitle && index === 0) {
            return (
              <Heading
                color={hasTailwindColor ? undefined : color}
                fontWeight="semibold"
                size="md"
                padding="12px 10px"
              >
                {linkText}
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
              {linkText}
            </Link>
          );
        })}
      </VStack>
    );
  },
};
