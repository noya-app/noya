import { AvatarBlock } from './AvatarBlock';
import { BoxBlock } from './BoxBlock';
import { ButtonBlock } from './ButtonBlock';
import { CheckboxBlock } from './CheckboxBlock';
import { ImageBlock } from './ImageBlock';
import { BlockDefinition } from './types';

export const Blocks: Record<string, BlockDefinition> = {
  [AvatarBlock.id]: AvatarBlock,
  [ButtonBlock.id]: ButtonBlock,
  [CheckboxBlock.id]: CheckboxBlock,
  [ImageBlock.id]: ImageBlock,
  [BoxBlock.id]: BoxBlock,
};
