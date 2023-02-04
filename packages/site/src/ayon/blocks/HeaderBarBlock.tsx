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
import { isWithinRectRange } from './score';
import { headerBarSymbol, headerBarSymbolId } from './symbols';
import { getBlockClassName, getTailwindClasses } from './tailwind';

const placeholderText = `*Home, Projects, Team, FAQ`;

const globalHashtags = ['dark', 'search', 'title', ...getTailwindClasses()];

export const HeaderBarBlock: BlockDefinition = {
  id: headerBarSymbolId,
  globalHashtags,
  placeholderText,
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
      globalParameters: { dark, title, ...globalParameters },
    } = parseBlock(props.blockText, 'commaSeparated', {
      placeholder: placeholderText,
      isGlobalParameter: (key) => globalHashtags.includes(key),
    });
    const hashTags = Object.keys(globalParameters);
    const hasActiveItem = items.some((item) => item.parameters.active);

    const backgroundColor = dark
      ? 'rgba(11,21,48,0.9)'
      : 'rgba(255,255,255,0.9)';
    const borderBottomColor = dark ? 'transparent' : '#eee';
    const searchBackgroundColor = dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)';
    const color = dark ? '#fff' : '#000';

    const hasTailwindBackground = hashTags.some((value) =>
      value.startsWith('bg-'),
    );
    const hasTailwindColor = hashTags.some((value) =>
      value.startsWith('text-'),
    );
    const hasTailwindBorder = hashTags.some((value) =>
      value.startsWith('border-'),
    );

    return (
      <Flex
        alignItems="center"
        borderBottomWidth={hasTailwindBorder ? undefined : 1}
        borderBottomColor={hasTailwindBorder ? undefined : borderBottomColor}
        height={`${props.frame.height}px`}
        paddingX="5px"
        backgroundColor={hasTailwindBackground ? undefined : backgroundColor}
        backdropFilter="auto"
        backdropBlur="10px"
        overflow="hidden"
        className={getBlockClassName(hashTags)}
      >
        {items.map(({ content: link, parameters: { active } }, index) => {
          let backgroundColor = 'transparent';

          if (active || (!hasActiveItem && index === 0)) {
            backgroundColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)';
          }

          if (title && index === 0) {
            return (
              <Heading
                color={hasTailwindColor ? undefined : color}
                fontWeight="semibold"
                size="sm"
                margin="0 18px 0 15px"
              >
                {link}
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
              color={hasTailwindColor ? undefined : color}
            >
              {link}
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
              children={
                <SearchIcon
                  color={hasTailwindColor ? undefined : color}
                  opacity={0.8}
                />
              }
            />
            <Input
              placeholder="Search"
              _placeholder={{ color: 'rgba(0,0,0,0.3)' }}
            />
          </InputGroup>
        )}
        <Avatar size={props.frame.height < 60 ? 'xs' : 'sm'} marginX="10px" />
      </Flex>
    );
  },
};
