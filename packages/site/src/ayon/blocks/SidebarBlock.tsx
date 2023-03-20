import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { getBlockThemeColorClasses } from './colors';
import { isWithinRectRange } from './score';
import { boxSymbolId, heading5SymbolId, linkSymbolId } from './symbolIds';
import { sidebarSymbol } from './symbols';

const placeholderText = `
*Dashboard 
Updates
Billing
Settings
`.trim();

const globalHashtags = ['dark', 'accent', 'title'];

const parser = 'newlineSeparated';

export const SidebarBlock: BlockDefinition = {
  symbol: sidebarSymbol,
  parser,
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
    const {
      items,
      parameters: { dark, accent, title },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hasActiveItem = items.some((item) => item.parameters.active);

    const { text, bg, activeLinkBg } = getBlockThemeColorClasses({
      dark,
      accent,
    });

    return props.getBlock(boxSymbolId).render(env, {
      symbolId: boxSymbolId,
      blockText: ['#flex-col #p-3 #gap-1', bg].join(' '),
      frame: props.frame,
      getBlock: props.getBlock,
      children: items.map(({ content, parameters: { active } }, index) => {
        const activeOrDefault =
          active || (!hasActiveItem && index === (title ? 1 : 0));

        if (title && index === 0) {
          return props.getBlock(heading5SymbolId).render(env, {
            blockText: [content, text, '#mb-4 #px-3 #py-2'].join(' '),
            symbolId: heading5SymbolId,
            getBlock: props.getBlock,
          });
        }

        return props.getBlock(boxSymbolId).render(env, {
          getBlock: props.getBlock,
          symbolId: boxSymbolId,
          blockText: [
            activeOrDefault ? activeLinkBg : '#bg-transparent',
            '#rounded #px-3 #py-2',
          ]
            .filter(Boolean)
            .join(' '),
          children: [
            props.getBlock(linkSymbolId).render(env, {
              blockText: [
                content,
                text,
                '#text-xs #no-underline',
                activeOrDefault ? '#font-semibold' : '',
              ]
                .filter(Boolean)
                .join(' '),
              symbolId: linkSymbolId,
              getBlock: props.getBlock,
            }),
          ],
        });
      }),
    });
  },
};
