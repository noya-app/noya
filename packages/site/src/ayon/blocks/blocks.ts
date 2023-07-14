import Sketch from 'noya-file-format';
import {
  heroButtonRowSymbol,
  heroHeadlineStackSymbol,
  heroSymbol,
} from '../symbols/composed/HeroSymbol';
import { avatarSymbol } from '../symbols/primitive/AvatarSymbol';
import { boxSymbol } from '../symbols/primitive/BoxSymbol';
import { buttonSymbol } from '../symbols/primitive/ButtonSymbol';
import { checkboxSymbol } from '../symbols/primitive/CheckboxSymbol';
import { tagSymbol } from '../symbols/primitive/TagSymbol';
import { heroSymbolV1Id } from '../symbols/symbolIds';

export const allSymbols = [
  avatarSymbol,
  buttonSymbol,
  boxSymbol,
  heroSymbol,
  heroHeadlineStackSymbol,
  heroButtonRowSymbol,
  tagSymbol,
  checkboxSymbol,
];

export const allInsertableSymbols = allSymbols.filter(
  (symbol) => !symbol.blockDefinition?.isPassthrough,
);

export const symbolMap: Record<string, Sketch.SymbolMaster> = {
  ...Object.fromEntries(allSymbols.map((symbol) => [symbol.symbolID, symbol])),
  // Add extra mappings here (e.g. heroV1 => heroV2)
  [heroSymbolV1Id]: heroSymbol,
};
