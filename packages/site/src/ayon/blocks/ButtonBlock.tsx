import { Button } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { isWithinRectRange } from './score';
import { buttonSymbolId } from './symbols';

export const ButtonBlock: BlockDefinition = {
  id: buttonSymbolId,
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 60, 30, 300, 80) ? 0.8 : 0,
  render: (props) => {
    const { content } = parseBlock(props.blockText, 'regular');

    let size;
    if (props.frame.height < 30) {
      size = 'xs' as const;
    } else if (props.frame.height > 50) {
      size = 'lg' as const;
    } else {
      size = 'md' as const;
    }

    return (
      <Button size={size} isFullWidth>
        {content}
      </Button>
    );
  },
};
