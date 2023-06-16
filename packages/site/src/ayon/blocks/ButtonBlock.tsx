import { ButtonProps } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { findLast } from 'noya-utils';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { buttonColors } from './blockTheme';
import { isWithinRectRange } from './score';
import { buttonSymbolId } from './symbolIds';
import { buttonSymbol } from './symbols';
import { parametersToTailwindStyle } from './tailwind';

const placeholderText = 'Submit';

const globalHashtags = ['dark', 'disabled', 'small', 'medium', 'large'];

const parser = 'regular';

const sizeKeys = new Set(['small', 'medium', 'large']);

export const ButtonBlock: BlockDefinition = {
  symbol: buttonSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 60,
      minHeight: 30,
      maxWidth: 300,
      maxHeight: 80,
    })
      ? 0.8
      : 0,
  render: ({ h, Components: { [buttonSymbolId]: Button } }, props) => {
    const { content, parameters } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hashtags = Object.keys(parameters);
    const size = findLast(hashtags, (key) => sizeKeys.has(key)) as
      | ButtonProps['size']
      | undefined;

    const style = parametersToTailwindStyle(parameters);

    if (parameters.dark) {
      Object.assign(
        style,
        parameters.disabled ? buttonColors.darkDisabled : buttonColors.dark,
      );
    } else if (parameters.light) {
      Object.assign(
        style,
        parameters.disabled ? buttonColors.lightDisabled : buttonColors.light,
      );
    }

    // if (props.frame && size === undefined) {
    //   if (props.frame.height < 30) {
    //     size = 'xs' as const;
    //   } else if (props.frame.height > 50) {
    //     size = 'lg' as const;
    //   } else {
    //     size = 'md' as const;
    //   }
    // }

    return h<ButtonProps>(
      Button,
      {
        ...applyCommonProps(props),
        ...(parameters.disabled && { disabled: true }),
        size,
        style: {
          ...style,
          ...(props.frame && {
            width: `${props.frame.width}px`,
          }),
        },
      },
      content,
    );
  },
};
