import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { getBlockThemeColorClasses } from './colors';
import { isWithinRectRange } from './score';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  heading6SymbolId,
  inputSymbolId,
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
      parameters: { dark, title, accent, search },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hasActiveItem = items
      .slice(title ? 1 : 0)
      .some((item) => item.parameters.active);

    const { text, bg, activeLinkBg, borderColor } = getBlockThemeColorClasses({
      dark,
      accent,
    });

    return props.getBlock(boxSymbolId).render(env, {
      symbolId: boxSymbolId,
      blockText: [
        '#flex-row #items-center #px-4 #gap-4 #border-b',
        bg,
        borderColor,
      ].join(' '),
      frame: props.frame,
      getBlock: props.getBlock,
      children: [
        ...items.map(({ content, parameters: { active, ...rest } }, index) => {
          const activeOrDefault =
            active || (!hasActiveItem && index === (title ? 1 : 0));

          if (title && index === 0) {
            return props.getBlock(heading6SymbolId).render(env, {
              blockText: [content, text, '#p-2', '#mr-6'].join(' '),
              symbolId: heading6SymbolId,
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
              '#small #shadow-none',
            ]
              .filter(Boolean)
              .join(' '),
            symbolId: buttonSymbolId,
            getBlock: props.getBlock,
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
            blockText: [
              'Search #basis-60',
              dark && '#dark',
              accent && '#accent',
            ]
              .filter(Boolean)
              .join(' '),
            getBlock: props.getBlock,
          }),
        props.getBlock(avatarSymbolId).render(env, {
          symbolId: avatarSymbolId,
          getBlock: props.getBlock,
          blockText: '#w-10',
        }),
      ],
    });
  },
};
