import { SearchIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Spacer,
} from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { isWithinRectRange } from './score';
import { headerBarSymbol, headerBarSymbolId } from './symbols';
import { getBlockClassName } from './tailwind';

const placeholderText = `*Home, Projects, Team, FAQ`;

const parser = 'commaSeparated';

export const HeaderBarBlock: BlockDefinition = {
  id: headerBarSymbolId,
  hashtags: ['dark', 'accent', 'search', 'title'],
  placeholderText,
  parser,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === headerBarSymbol.symbolID)
    ) {
      return 0;
    }

    return Math.max(
      isWithinRectRange(frame, 400, 30, 2000, 100) &&
        frame.x < 30 &&
        frame.y < 30
        ? 1
        : 0,
      0.1,
    );
  },
  render: (props) => {
    const {
      items,
      parameters: { dark, title, accent, search, ...globalParameters },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hashtags = Object.keys(globalParameters);
    const hasActiveItem = items.some((item) => item.parameters.active);

    const {
      backgroundColor,
      borderColor,
      searchBackgroundColor,
      color,
      activeLinkBackgroundColor,
    } = getBlockThemeColors({ dark, accent });

    const height = props.frame?.height ?? 60;

    return (
      <Flex
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor={borderColor}
        height={`${height}px`}
        paddingX="5px"
        backgroundColor={backgroundColor}
        backdropFilter="auto"
        backdropBlur="10px"
        overflow="hidden"
        className={getBlockClassName(hashtags)}
      >
        {items.map(({ content, parameters: { active, ...rest } }, index) => {
          const className = getBlockClassName(Object.keys(rest));

          let backgroundColor = 'transparent';

          if (active || (!hasActiveItem && index === 0)) {
            backgroundColor = activeLinkBackgroundColor;
          }

          if (title && index === 0) {
            return (
              <Heading
                color={color}
                fontWeight="semibold"
                size="sm"
                margin="0 18px 0 15px"
                className={className}
              >
                {content}
              </Heading>
            );
          }

          return (
            <Link
              marginX="5px"
              padding="8px 14px"
              borderRadius="3px"
              fontSize="12px"
              fontWeight="medium"
              backgroundColor={backgroundColor}
              color={color}
              className={className}
            >
              {content}
            </Link>
          );
        })}
        <Spacer />
        {search && (
          <InputGroup
            flex="0.35"
            marginX="10px"
            size="sm"
            borderColor="rgba(0,0,0,0.1)"
            backgroundColor={searchBackgroundColor}
          >
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color={color} opacity={0.8} />}
            />
            <Input placeholder="Search" />
          </InputGroup>
        )}
        <Avatar size={height < 60 ? 'xs' : 'sm'} marginX="10px" />
      </Flex>
    );
  },
};
