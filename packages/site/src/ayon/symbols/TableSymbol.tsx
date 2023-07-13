import { TableProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { getBlockThemeColors } from '../blocks/blockTheme';
import { getParameters } from '../utils/getMappedParameters';
import { tableSymbolId } from './symbolIds';
import { RenderProps } from './types';

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

export const tableSymbol = SketchModel.symbolMaster({
  symbolID: tableSymbolId,
  name: 'Table',
  blockDefinition: {
    hashtags: globalHashtags,
    placeholderText,
    infer: () => 0,
    render: ({ Components, instance }: RenderProps) => {
      const Table: React.FC<TableProps<any>> = Components[tableSymbolId];

      const { dark, accent } = getParameters(instance.blockParameters);

      const { backgroundColor, color } = getBlockThemeColors({
        dark,
        accent,
      });

      return (
        <Table
          data={[]}
          columns={[]}
          style={{
            overflowY: 'auto',
            backgroundColor,
            backdropFilter: 'blur(10px)',
            color,
          }}
        />
      );
    },
  },
});
