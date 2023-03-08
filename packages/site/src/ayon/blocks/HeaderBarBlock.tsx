import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { getBlockThemeColorClasses } from './colors';
import { isWithinRectRange } from './score';
import {
  avatarSymbolId,
  boxSymbolId,
  heading6SymbolId,
  inputSymbolId,
  linkSymbolId,
  spacerSymbolId,
} from './symbolIds';
import { headerBarSymbol } from './symbols';

const placeholderText = `*Home, Projects, Team, FAQ`;

const parser = 'commaSeparated';

export const HeaderBarBlock: BlockDefinition = {
  symbol: headerBarSymbol,
  hashtags: ['dark', 'accent', 'search', 'title'],
  placeholderText,
  parser,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === headerBarSymbol.symbolID)
    ) {
      return 0;
    }

    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 400,
        minHeight: 30,
        maxWidth: 2000,
        maxHeight: 100,
      }) &&
        frame.x < 30 &&
        frame.y < 30
        ? 1
        : 0,
      0.1,
    );
  },
  render: (env, props) => {
    const {
      items,
      parameters: { dark, title, accent, search, ...globalParameters },
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
      blockText: ['#flex-row #items-center #px-4 #gap-6', bg].join(' '),
      frame: props.frame,
      getBlock: props.getBlock,
      children: [
        ...items.map(({ content, parameters: { active, ...rest } }, index) => {
          const activeOrDefault =
            active || (!hasActiveItem && index === (title ? 1 : 0));

          if (title && index === 0) {
            return props.getBlock(heading6SymbolId).render(env, {
              blockText: [content, text, '#p-2'].join(' '),
              symbolId: heading6SymbolId,
              getBlock: props.getBlock,
            });
          }

          return props.getBlock(boxSymbolId).render(env, {
            getBlock: props.getBlock,
            symbolId: boxSymbolId,
            blockText: [
              activeOrDefault ? activeLinkBg : '#bg-transparent',
              '#rounded #p-2',
            ]
              .filter(Boolean)
              .join(' '),
            children: [
              props.getBlock(linkSymbolId).render(env, {
                blockText: [
                  content,
                  text,
                  '#no-underline',
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
        props.getBlock(spacerSymbolId).render(env, {
          symbolId: spacerSymbolId,
          blockText: '#flex-1',
          getBlock: props.getBlock,
        }),
        search &&
          props.getBlock(inputSymbolId).render(env, {
            symbolId: inputSymbolId,
            blockText: ['Search', dark && '#dark', accent && '#accent']
              .filter(Boolean)
              .join(' '),
            getBlock: props.getBlock,
          }),
        props.getBlock(avatarSymbolId).render(env, {
          symbolId: avatarSymbolId,
          getBlock: props.getBlock,
        }),
      ],
    });
  },
};
