import { Flex, Heading, ThemingProps } from '@chakra-ui/react';
import Sketch from 'noya-file-format';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { scoreCommandMatch } from './score';
import {
  heading1Symbol,
  heading2Symbol,
  heading3Symbol,
  heading4Symbol,
  heading5Symbol,
  heading6Symbol,
} from './symbols';

const createHeadingBlock = (
  symbol: Sketch.SymbolMaster,
  size: ThemingProps['size'],
): BlockDefinition => ({
  id: symbol.symbolID,
  infer: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(symbol.name, blockText), 0.1),
  render: (props) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Flex justify={align}>
        <Heading
          size={size}
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {content}
        </Heading>
      </Flex>
    );
  },
});

export const Heading1Block = createHeadingBlock(heading1Symbol, '2xl');
export const Heading2Block = createHeadingBlock(heading2Symbol, 'xl');
export const Heading3Block = createHeadingBlock(heading3Symbol, 'lg');
export const Heading4Block = createHeadingBlock(heading4Symbol, 'md');
export const Heading5Block = createHeadingBlock(heading5Symbol, 'sm');
export const Heading6Block = createHeadingBlock(heading6Symbol, 'xs');
