import { IconProps, LinkProps, component } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { linkSymbolId } from './symbolIds';
import { linkSymbol } from './symbols';
import { parametersToTailwindStyle, tailwindTextClasses } from './tailwind';

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
  render: (
    {
      h,
      Components: {
        [linkSymbolId]: Link,
        [component.id.IconArrowForward]: IconArrowForward,
      },
    },
    props,
  ) => {
    const { content, parameters } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const style = parametersToTailwindStyle(parameters);

    const linkProps: LinkProps = {
      ...applyCommonProps(props),
      style,
      href: '#',
    };

    const iconProps: IconProps = {
      size: '16px',
      style: {
        verticalAlign: 'text-bottom',
        marginLeft: '4px',
      },
    };

    const hasIcon = parameters['icon-arrow-forward'];

    return h(Link, linkProps, [
      content,
      ...(hasIcon ? [h(IconArrowForward, iconProps)] : []),
    ]);
  },
};
