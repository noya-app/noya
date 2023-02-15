import { Switch } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { switchSymbol } from './symbols';

const placeholderText = '#off';

const globalHashtags = ['on', 'off', 'disabled'];

const parser = 'regular';

export const SwitchBlock: BlockDefinition = {
  symbol: switchSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) => 0.1,
  render: (props) => {
    const {
      parameters: { on, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });
    const height = props.frame?.height ?? 25;
    const size = height >= 35 ? 'lg' : height >= 25 ? 'md' : 'sm';
    return <Switch size={size} isChecked={!!on} isDisabled={!!disabled} />;
  },
};
