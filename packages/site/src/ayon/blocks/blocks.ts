import { avatarSymbol } from '../symbols/AvatarSymbol';
import { boxSymbol } from '../symbols/BoxSymbol';
import { buttonSymbol } from '../symbols/ButtonSymbol';
import { checkboxSymbol } from '../symbols/CheckboxSymbol';
import {
  heroButtonRowSymbol,
  heroHeadlineStackSymbol,
  heroSymbol,
} from '../symbols/composed/HeroSymbol';
import { tagSymbol } from '../symbols/TagSymbol';

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

// Add extra mappings here (e.g. heroV1 => heroV2)
export const symbolMap = Object.fromEntries(
  allSymbols.map((symbol) => [symbol.symbolID, symbol]),
);
