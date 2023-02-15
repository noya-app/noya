import { Table, Td, Th, Thead, Tr, VStack } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { tableSymbolId } from './symbols';

const placeholderText = `
Products, Price, Quantity 
Apples, $1, 7
Oranges, $2, 18
Bananas, $1, 12
Pears, $2, 3
Cherries, $5, 65
Mangos, $4, 33
Pineapples, $6, 29
Grapes, $4, 15
Strawberries, $3, 89
`.trim();

const globalHashtags = ['dark', 'accent', 'sm', 'md', 'lg'];

const parser = 'table';

export const TableBlock: BlockDefinition = {
  id: tableSymbolId,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText, siblingBlocks }) => {
    return 0;
  },
  render: (props) => {
    const {
      rows,
      parameters: { dark, accent, sm, md, lg },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    const size = sm ? 'sm' : md ? 'md' : lg ? 'lg' : 'md';

    return (
      <VStack
        alignItems="left"
        height={`100%`}
        backgroundColor={backgroundColor}
        backdropFilter="auto"
        backdropBlur="10px"
        overflowY="auto"
        border={`1px solid ${borderColor}`}
        color={color}
      >
        <Table size={size}>
          {rows.length > 0 && (
            <Thead>
              <Tr>
                {rows[0].items.map((cell, i) => (
                  <Th key={i}>{cell.content}</Th>
                ))}
              </Tr>
            </Thead>
          )}
          {rows.slice(1).map((row, i) => (
            <Tr key={i}>
              {row.items.map((cell, j) => (
                <Td key={`${i}-${j}`}>{cell.content}</Td>
              ))}
            </Tr>
          ))}
        </Table>
      </VStack>
    );
  },
};
