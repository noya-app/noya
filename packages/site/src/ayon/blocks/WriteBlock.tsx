import { Flex, Spinner, Text } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { getTextAlign, parseBlock } from '../parse';
import { writeSymbolId } from './symbols';
import { getBlockClassName, tailwindTextClasses } from './tailwind';

export const WriteBlock: BlockDefinition = {
  id: writeSymbolId,
  globalHashtags: ['left', 'right', 'center', ...tailwindTextClasses],
  infer: ({ frame, blockText }) => 0.1,
  render: (props) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');

    const hashtags = Object.keys(parameters);

    return (
      <Text
        textAlign={getTextAlign(parameters)}
        className={getBlockClassName(hashtags)}
      >
        {props.resolvedBlockData?.resolvedText ?? (
          <Flex align="center">
            {props.blockText && (
              <>
                <Spinner thickness="3px" color="gray" speed="1.5s" />
                <span style={{ marginLeft: 10 }}>
                  Writing about {content}...
                </span>
              </>
            )}
            {!props.blockText && 'Waiting for input...'}
          </Flex>
        )}
      </Text>
    );
  },
};
