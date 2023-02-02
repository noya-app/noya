import { Flex, Spinner, SystemProps, Text } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { writeSymbolId } from './symbols';
import { getBlockClassName } from './tailwind';

export const WriteBlock: BlockDefinition = {
  id: writeSymbolId,
  infer: ({ frame, blockText }) => 0.1,
  render: (props) => {
    const { color, fontWeight, fontSize, align, hashTags } =
      filterTextPropertyHashTags(props.blockText);

    const hasTailwindColor = hashTags.some((value) =>
      value.startsWith('text-'),
    );

    return (
      <Text
        color={hasTailwindColor ? undefined : color}
        fontWeight={fontWeight}
        fontSize={fontSize}
        align={align as SystemProps['textAlign']}
        className={getBlockClassName(hashTags)}
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
