import { Sketch } from '@noya-app/noya-file-format';

import * as avatar from './primitive/AvatarSymbol';
import * as box from './primitive/BoxSymbol';
import * as button from './primitive/ButtonSymbol';
import * as checkbox from './primitive/CheckboxSymbol';
import * as image from './primitive/ImageSymbol';
import * as input from './primitive/InputSymbol';
import * as link from './primitive/LinkSymbol';
import * as radio from './primitive/RadioSymbol';
import * as select from './primitive/SelectSymbol';
import * as switch_ from './primitive/SwitchSymbol';
import * as table from './primitive/TableSymbol';
import * as tag from './primitive/TagSymbol';
import * as text from './primitive/TextSymbol';
import * as textarea from './primitive/TextareaSymbol';

import * as card from './composed/CardSymbol';
import * as feature from './composed/FeatureSymbol';
import * as hero from './composed/HeroSymbol';
import * as sidebar from './composed/SidebarSymbol';
import * as signIn from './composed/SignInSymbol';

import { ApplicationState, Selectors } from 'noya-state';
import { heroSymbolV1Id } from './symbolIds';

export const librarySymbols = [
  ...Object.values(avatar),
  ...Object.values(box),
  ...Object.values(button),
  ...Object.values(card),
  ...Object.values(checkbox),
  ...Object.values(feature),
  ...Object.values(hero),
  ...Object.values(image),
  ...Object.values(input),
  ...Object.values(link),
  ...Object.values(radio),
  ...Object.values(select),
  ...Object.values(signIn),
  ...Object.values(sidebar),
  ...Object.values(switch_),
  ...Object.values(table),
  ...Object.values(tag),
  ...Object.values(text),
  ...Object.values(textarea),
];

function filterInsertableSymbol(
  symbol: Sketch.SymbolMaster,
): symbol is Sketch.SymbolMaster {
  return (
    symbol.symbolID !== heroSymbolV1Id &&
    symbol.blockDefinition?.isInsertable !== false
  );
}

export const insertableLibrarySymbols = librarySymbols.filter(
  filterInsertableSymbol,
);

export const librarySymbolMap: Record<string, Sketch.SymbolMaster> =
  Object.fromEntries(librarySymbols.map((symbol) => [symbol.symbolID, symbol]));

export const getAllInsertableSymbols = (state: ApplicationState) =>
  Selectors.getSymbols(state).filter(filterInsertableSymbol);
