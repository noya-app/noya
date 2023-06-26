import Sketch from 'noya-file-format';
import { BlockDefinition } from 'noya-state';
import { AvatarBlock } from './AvatarBlock';
import { BoxBlock } from './BoxBlock';
import { ButtonBlock } from './ButtonBlock';
import { CardBlock } from './CardBlock';
import { CheckboxBlock } from './CheckboxBlock';
import { HeaderBarBlock } from './HeaderBarBlock';
import {
  Heading1Block,
  Heading2Block,
  Heading3Block,
  Heading4Block,
  Heading5Block,
  Heading6Block,
} from './HeadingBlock';
import { HeroBlockV2, HeroWithImageBlock } from './HeroBlock';
import { IconBlock } from './IconBlock';
import { ImageBlock } from './ImageBlock';
import { InputBlock } from './InputBlock';
import { LinkBlock } from './LinkBlock';
import { RadioBlock } from './RadioBlock';
import { SelectBlock } from './SelectBlock';
import { SidebarBlock } from './SidebarBlock';
import { SignInBlock } from './SignInBlock';
import { SpacerBlock } from './SpacerBlock';
import { SwitchBlock } from './SwitchBlock';
import { TableBlock } from './TableBlock';
import { TagBlock } from './TagBlock';
import { TextBlock } from './TextBlock';
import { TextareaBlock } from './TextareaBlock';
import { TileCardBlock } from './TileCardBlock';
import { WriteBlock } from './WriteBlock';
import { renderStack } from './render';
import { heroSymbolId } from './symbolIds';
import { heroButtonRowSymbol, heroHeadlineStackSymbol } from './symbols';

function createPassthroughBlock(symbol: Sketch.SymbolMaster): BlockDefinition {
  return {
    symbol,
    infer: () => 0,
    parser: 'regular',
    isPassthrough: true,
    editorVersion: 2,
    render: (env, props) =>
      renderStack(env, {
        props,
        block: {
          placeholderText: '',
          symbol,
        },
      }),
  };
}

export const Blocks: Record<string, BlockDefinition> = {
  [AvatarBlock.symbol.symbolID]: AvatarBlock,
  [ButtonBlock.symbol.symbolID]: ButtonBlock,
  [BoxBlock.symbol.symbolID]: BoxBlock,
  [CheckboxBlock.symbol.symbolID]: CheckboxBlock,
  [HeaderBarBlock.symbol.symbolID]: HeaderBarBlock,
  [Heading1Block.symbol.symbolID]: Heading1Block,
  [Heading2Block.symbol.symbolID]: Heading2Block,
  [Heading3Block.symbol.symbolID]: Heading3Block,
  [Heading4Block.symbol.symbolID]: Heading4Block,
  [Heading5Block.symbol.symbolID]: Heading5Block,
  [Heading6Block.symbol.symbolID]: Heading6Block,
  [heroSymbolId]: HeroBlockV2,
  [HeroBlockV2.symbol.symbolID]: HeroBlockV2,
  [HeroWithImageBlock.symbol.symbolID]: HeroWithImageBlock,
  [ImageBlock.symbol.symbolID]: ImageBlock,
  [InputBlock.symbol.symbolID]: InputBlock,
  [SwitchBlock.symbol.symbolID]: SwitchBlock,
  [TextBlock.symbol.symbolID]: TextBlock,
  [WriteBlock.symbol.symbolID]: WriteBlock,
  [IconBlock.symbol.symbolID]: IconBlock,
  [SidebarBlock.symbol.symbolID]: SidebarBlock,
  [TableBlock.symbol.symbolID]: TableBlock,
  [SelectBlock.symbol.symbolID]: SelectBlock,
  [RadioBlock.symbol.symbolID]: RadioBlock,
  [TextareaBlock.symbol.symbolID]: TextareaBlock,
  [SpacerBlock.symbol.symbolID]: SpacerBlock,
  [CardBlock.symbol.symbolID]: CardBlock,
  [TileCardBlock.symbol.symbolID]: TileCardBlock,
  [SignInBlock.symbol.symbolID]: SignInBlock,
  [LinkBlock.symbol.symbolID]: LinkBlock,
  [TagBlock.symbol.symbolID]: TagBlock,
  [heroButtonRowSymbol.symbolID]: createPassthroughBlock(heroButtonRowSymbol),
  [heroHeadlineStackSymbol.symbolID]: createPassthroughBlock(
    heroHeadlineStackSymbol,
  ),
};

export const allInsertableBlocks = Object.entries(Blocks)
  .filter(([id, { isPassthrough }]) => id !== heroSymbolId && !isPassthrough)
  .map(([, block]) => block);

export const allInsertableSymbols = allInsertableBlocks.map(
  (block) => block.symbol,
);
