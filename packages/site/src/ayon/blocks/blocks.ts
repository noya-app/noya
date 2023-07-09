import Sketch from 'noya-file-format';
import { BlockDefinition } from 'noya-state';
import { avatarSymbol } from '../symbols/AvatarSymbol';
import { boxSymbol } from '../symbols/BoxSymbol';
import { buttonSymbol } from '../symbols/ButtonSymbol';
import {
  heroButtonRowSymbol,
  heroHeadlineStackSymbol,
  heroSymbolX,
} from '../symbols/HeroSymbol';
import { heroSymbolId } from '../symbols/symbolIds';
import {
  InferBlockMap,
  cardSymbol,
  featureItemDetailsSymbol,
  featureItemSymbol,
  featureRowSymbol,
  featureSectionSymbol,
  signInSymbol,
  tileCardSymbol,
} from '../symbols/symbols';
import { HeaderBarBlock } from './HeaderBarBlock';
import {
  Heading1Block,
  Heading2Block,
  Heading3Block,
  Heading4Block,
  Heading5Block,
  Heading6Block,
} from './HeadingBlock';
import { IconBlock } from './IconBlock';
import { SidebarBlock } from './SidebarBlock';
import { SpacerBlock } from './SpacerBlock';
import { WriteBlock } from './WriteBlock';
import { AvatarBlock } from './elements/AvatarBlock';
import { BoxBlock } from './elements/BoxBlock';
import { ButtonBlock } from './elements/ButtonBlock';
import { CheckboxBlock } from './elements/CheckboxBlock';
import { ImageBlock } from './elements/ImageBlock';
import { InputBlock } from './elements/InputBlock';
import { LinkBlock } from './elements/LinkBlock';
import { RadioBlock } from './elements/RadioBlock';
import { SelectBlock } from './elements/SelectBlock';
import { SwitchBlock } from './elements/SwitchBlock';
import { TableBlock } from './elements/TableBlock';
import { TagBlock } from './elements/TagBlock';
import { TextBlock } from './elements/TextBlock';
import { TextareaBlock } from './elements/TextareaBlock';
import { renderStack } from './render';

function createStandardBlock(symbol: Sketch.SymbolMaster): BlockDefinition {
  return {
    symbol,
    ...symbol.blockDefinition,
    infer: InferBlockMap[symbol.symbolID] ?? (() => 0),
    render(env, props) {
      return renderStack(env, { props, block: this });
    },
  };
}

function createPassthroughBlock(symbol: Sketch.SymbolMaster): BlockDefinition {
  return {
    ...createStandardBlock(symbol),
    isPassthrough: true,
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
  [LinkBlock.symbol.symbolID]: LinkBlock,
  [TagBlock.symbol.symbolID]: TagBlock,
  [cardSymbol.symbolID]: createStandardBlock(cardSymbol),
  [tileCardSymbol.symbolID]: createStandardBlock(tileCardSymbol),
  [signInSymbol.symbolID]: createStandardBlock(signInSymbol),
  [featureItemSymbol.symbolID]: createStandardBlock(featureItemSymbol),
  [featureItemDetailsSymbol.symbolID]: createPassthroughBlock(
    featureItemDetailsSymbol,
  ),
  [featureSectionSymbol.symbolID]: createStandardBlock(featureSectionSymbol),
  [featureRowSymbol.symbolID]: createPassthroughBlock(featureRowSymbol),
  [heroHeadlineStackSymbol.symbolID]: createPassthroughBlock(
    heroHeadlineStackSymbol,
  ),
  [heroButtonRowSymbol.symbolID]: createPassthroughBlock(heroButtonRowSymbol),
  [heroSymbolX.symbolID]: createStandardBlock(heroSymbolX),
};

export const allInsertableBlocks = Object.entries(Blocks)
  .filter(([id, { isPassthrough }]) => id !== heroSymbolId && !isPassthrough)
  .map(([, block]) => block)
  .sort((a, b) => a.symbol.name.localeCompare(b.symbol.name));

export const allInsertableSymbols = [
  avatarSymbol,
  buttonSymbol,
  boxSymbol,
  heroSymbolX,
];

export const nonInsertableSymbols = [
  heroHeadlineStackSymbol,
  heroButtonRowSymbol,
];

export const allSymbols = [...allInsertableSymbols, ...nonInsertableSymbols];

// Add extra mappings here (e.g. heroV1 => heroV2)
export const symbolMap = Object.fromEntries(
  allSymbols.map((symbol) => [symbol.symbolID, symbol]),
);
