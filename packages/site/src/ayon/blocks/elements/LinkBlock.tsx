import { IconProps, LinkProps, component } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { linkSymbolId } from '../../symbols/symbolIds';
import { linkSymbol } from '../../symbols/symbols';
import {
  parametersToTailwindStyle,
  tailwindTextClasses,
} from '../../tailwind/tailwind';
import { getParameters } from '../../utils/getMappedParameters';
import { applyCommonProps } from '../applyCommonProps';

const placeholderText = 'Read More';

export const LinkBlock: BlockDefinition = {
  symbol: linkSymbol,
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
    const content = props.blockText ?? placeholderText;
    const parameters = getParameters(props.blockParameters);

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
