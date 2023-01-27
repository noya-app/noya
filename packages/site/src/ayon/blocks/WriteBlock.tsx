import { Flex, Spinner, SystemProps, Text } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { scoreCommandMatch } from './score';
import { writeSymbol, writeSymbolId } from './symbols';

export const WriteBlock: BlockDefinition = {
  id: writeSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(writeSymbol.name, blockText), 0.1),
  render: (props) => {
    const { color, fontWeight, fontSize, align } = filterTextPropertyHashTags(
      props.blockText,
    );
    return (
      <Text
        color={color}
        fontWeight={fontWeight}
        fontSize={fontSize}
        align={align as SystemProps['textAlign']}
      >
        {props.resolvedBlockData?.resolvedText ?? (
          <Flex align="center">
            {props.blockText && (
              <>
                <Spinner
                  thickness="3px"
                  color="gray"
                  size={fontSize}
                  speed="1.5s"
                />
                <span style={{ marginLeft: 10 }}>Thinking...</span>
              </>
            )}
            {!props.blockText && 'Waiting for input...'}
          </Flex>
        )}
      </Text>
    );
  },
};
