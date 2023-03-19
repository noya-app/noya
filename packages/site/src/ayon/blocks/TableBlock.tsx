import { component } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
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

const parser = 'table';

export const TableBlock: BlockDefinition = {
  symbol: tableSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: () => 0,
  render: (
    {
      h,
      Components: {
        [component.id.tableContainer]: TableContainer,
        [component.id.table]: Table,
        [component.id.tableHead]: TableHead,
        [component.id.tableBody]: TableBody,
        [component.id.tableRow]: TableRow,
        [component.id.tableHeadCell]: TableHeadCell,
        [component.id.tableCell]: TableCell,
      },
    },
    props,
  ) => {
    const {
      rows,
      parameters: { dark, accent },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const { backgroundColor, color } = getBlockThemeColors({
      dark,
      accent,
    });

    return h(
      TableContainer,
      {
        ...applyCommonProps(props),
        style: {
          ...(props.frame && {
            width: `${props.frame.width}px`,
            height: `${props.frame.height}px`,
          }),
          overflowY: 'auto',
          backgroundColor,
          backdropFilter: 'auto',
          backdropBlur: '10px',
        },
      },
      h(Table, {}, [
        rows.length > 0 &&
          h(TableHead, {}, [
            h(
              TableRow,
              {},
              rows[0].items.map((cell, i) =>
                h(TableHeadCell, { key: i, style: { color } }, [cell.content]),
              ),
            ),
          ]),
        h(
          TableBody,
          {},
          rows.slice(1).map((row, i) =>
            h(
              TableRow,
              { key: i },
              row.items.map((cell, j) =>
                h(TableCell, { key: `${i}-${j}`, style: { color } }, [
                  cell.content,
                ]),
              ),
            ),
          ),
        ),
      ]),
    );
  },
};
