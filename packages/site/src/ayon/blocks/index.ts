import { ButtonBlock } from './ButtonBlock';
import { buttonSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const Blocks: Record<string, BlockDefinition> = {
  [buttonSymbolId]: ButtonBlock,
};
