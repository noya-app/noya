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
import { HeroBlockV2 } from './HeroBlock';
import { HeroBlockV1 } from './HeroBlockV1';
import { IconBlock } from './IconBlock';
import { ImageBlock } from './ImageBlock';
import { InputBlock } from './InputBlock';
import { LinkBlock } from './LinkBlock';
import { RadioBlock } from './RadioBlock';
import { renderStack } from './render';
import { SelectBlock } from './SelectBlock';
import { SidebarBlock } from './SidebarBlock';
import { SignInBlock } from './SignInBlock';
import { SpacerBlock } from './SpacerBlock';
import { SwitchBlock } from './SwitchBlock';
import { heroButtonRowSymbol } from './symbols';
import { TableBlock } from './TableBlock';
import { TextareaBlock } from './TextareaBlock';
import { TextBlock } from './TextBlock';
import { TileCardBlock } from './TileCardBlock';
import { WriteBlock } from './WriteBlock';

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
  [HeroBlockV1.symbol.symbolID]: HeroBlockV1,
  [HeroBlockV2.symbol.symbolID]: HeroBlockV2,
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
  [heroButtonRowSymbol.symbolID]: createPassthroughBlock(heroButtonRowSymbol),
};

export const allInsertableBlocks = Object.values(Blocks).filter(
  ({ isPassthrough, symbol }) =>
    !isPassthrough && /update/i.test(symbol.name) === false,
);

export const allInsertableSymbols = allInsertableBlocks.map(
  (block) => block.symbol,
);
