import { Button } from '@chakra-ui/react';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { isWithinRectRange, scoreCommandMatch } from './score';
import { buttonSymbol, buttonSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const ButtonBlock: BlockDefinition = {
  id: buttonSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(buttonSymbol.name, blockText),
      isWithinRectRange(frame, 60, 30, 300, 80) ? 0.8 : 0,
    ),
  render: (props) => {
    const { content, colorScheme, fontWeight, fontSize } =
      filterTextPropertyHashTags(props.blockText);
    let size;
    if (props.frame.height < 30) {
      size = 'xs' as const;
    } else if (props.frame.height > 50) {
      size = 'lg' as const;
    } else {
      size = 'md' as const;
    }
    return (
      <Button
        colorScheme={colorScheme}
        fontWeight={fontWeight}
        fontSize={fontSize}
        size={size}
        isFullWidth
      >
        {content}
      </Button>
    );
  },
};
