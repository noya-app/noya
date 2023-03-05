import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Link } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { linkSymbol } from './symbols';
import {
  getBlockClassName,
  hasClassGroup,
  tailwindTextClasses,
} from './tailwind';

const placeholderText = 'Read More';

const parser = 'regular';

export const LinkBlock: BlockDefinition = {
  symbol: linkSymbol,
  parser,
  hashtags: [
    'icon-arrow-forward',
    'left',
    'center',
    'right',
    ...tailwindTextClasses,
    'flex-1',
  ],
  placeholderText,
  infer: ({ frame, blockText }) => 0,
  render: (props) => {
    const { content, parameters } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hashtags = Object.keys(parameters);
    const hasColor = hasClassGroup('textColor', hashtags);

    return (
      <Link
        {...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        })}
        fontWeight="semibold"
        color={hasColor ? '' : 'dodgerblue'}
        className={getBlockClassName(hashtags)}
      >
        {content}
        {parameters['icon-arrow-forward'] && (
          <>
            {' '}
            <ArrowForwardIcon
              style={{
                verticalAlign: 'text-bottom',
              }}
            />
          </>
        )}
      </Link>
    );
  },
};
