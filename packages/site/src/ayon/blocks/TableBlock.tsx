import { TableProps, component } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { ParsedCompositeBlock } from '../parse';
import { getParameters } from '../utils/getMappedParameters';
import { applyCommonProps } from './applyCommonProps';
import { getBlockThemeColors } from './colors';
import { tableSymbol } from './symbols';

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

export const TableBlock: BlockDefinition = {
  symbol: tableSymbol,
  hashtags: globalHashtags,
  placeholderText,
  infer: () => 0,
  render: ({ h, Components: { [component.id.Table]: Table } }, props) => {
    const rows: ParsedCompositeBlock[] = [];
    const { dark, accent } = getParameters(props.blockParameters);

    const { backgroundColor, color } = getBlockThemeColors({
      dark,
      accent,
    });

    const columns: TableProps<Record<string, any>>['columns'] =
      rows[0].items.map((cell, index) => ({
        title: cell.content,
        dataKey: index.toString(),
      }));

    const data = rows.slice(1).map((row) =>
      row.items.reduce<Record<string, any>>((result, cell, index) => {
        result[index.toString()] = cell.content;
        return result;
      }, {}),
    );

    return h(Table, {
      ...applyCommonProps(props),
      data,
      columns,
      style: {
        ...(props.frame && {
          width: `${props.frame.width}px`,
          height: `${props.frame.height}px`,
        }),
        overflowY: 'auto',
        backgroundColor,
        backdropFilter: 'blur(10px)',
        color,
      },
    });
  },
};
