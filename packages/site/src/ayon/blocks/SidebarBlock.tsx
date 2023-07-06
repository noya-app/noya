import { BlockDefinition } from 'noya-state';
import { ParsedBlockItem } from '../parse';
import { getParameters } from '../utils/getMappedParameters';
import { getBlockThemeColorClasses } from './colors';
import { isWithinRectRange } from './score';
import { boxSymbolId, buttonSymbolId, heading5SymbolId } from './symbolIds';
import { sidebarSymbol } from './symbols';

const placeholderText = `
*Dashboard 
Updates
Billing
Settings
`.trim();

const globalHashtags = ['dark', 'accent', 'title'];

export const SidebarBlock: BlockDefinition = {
  symbol: sidebarSymbol,
  hashtags: globalHashtags,
  placeholderText,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === sidebarSymbol.symbolID)
    ) {
      return 0;
    }

    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 120,
        minHeight: 300,
        maxWidth: 240,
        maxHeight: 2000,
      })
        ? 1
        : 0,
      0.1,
    );
  },
  render: (env, props) => {
    const items: ParsedBlockItem[] = [];
    const { dark, accent, title } = getParameters(props.blockParameters);

    const hasActiveItem = items
      .slice(title ? 1 : 0)
      .some((item) => item.parameters.active);

    const { text, bg, activeLinkBg } = getBlockThemeColorClasses({
      dark,
      accent,
    });

    return props.getBlock(boxSymbolId).render(env, {
      symbolId: boxSymbolId,
      blockText: ['#flex-col #p-4 #gap-3', bg].join(' '),
      frame: props.frame,
      getBlock: props.getBlock,
      children: items.map(({ content, parameters: { active } }, index) => {
        const activeOrDefault =
          active || (!hasActiveItem && index === (title ? 1 : 0));

        if (title && index === 0) {
          return props.getBlock(heading5SymbolId).render(env, {
            blockText: [content, text, '#mb-4'].join(' '),
            symbolId: heading5SymbolId,
            getBlock: props.getBlock,
          });
        }

        return props.getBlock(buttonSymbolId).render(env, {
          blockText: [
            content,
            ...(dark || accent
              ? [text, activeOrDefault ? activeLinkBg : '']
              : []),
            activeOrDefault ? '#solid' : '#text',
            '#shadow-none #left',
          ]
            .filter(Boolean)
            .join(' '),
          symbolId: buttonSymbolId,
          getBlock: props.getBlock,
        });
      }),
    });
  },
};
