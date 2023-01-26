import { SearchIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Spacer,
} from '@chakra-ui/react';
import React from 'react';
import { filterHashTagsAndSlashCommands } from '../parse';
import { isWithinRectRange, scoreCommandMatch } from './score';
import { headerBarSymbol, headerBarSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const HeaderBarBlock: BlockDefinition = {
  id: headerBarSymbolId,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === headerBarSymbol.symbolID)
    ) {
      return 0;
    }

    return Math.max(
      scoreCommandMatch(headerBarSymbol.name, blockText),
      isWithinRectRange(frame, 400, 30, 2000, 100) &&
        frame.x < 30 &&
        frame.y < 30
        ? 1
        : 0,
      0.1,
    );
  },
  render: (props) => {
    const { content, hashTags } = filterHashTagsAndSlashCommands(
      props.blockText,
    );
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
};
