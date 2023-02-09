import { BlockDefinition } from 'noya-state';
import { AvatarBlock } from './AvatarBlock';
import { BoxBlock } from './BoxBlock';
import { ButtonBlock } from './ButtonBlock';
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
import { HeroBlock } from './HeroBlock';
import { IconBlock } from './IconBlock';
import { ImageBlock } from './ImageBlock';
import { InputBlock } from './InputBlock';
import { SelectBlock } from './SelectBlock';
import { SidebarBlock } from './SidebarBlock';
import { SwitchBlock } from './SwitchBlock';
import { TableBlock } from './TableBlock';
import { TextBlock } from './TextBlock';
import { WriteBlock } from './WriteBlock';

export const Blocks: Record<string, BlockDefinition> = {
  [AvatarBlock.id]: AvatarBlock,
  [ButtonBlock.id]: ButtonBlock,
  [BoxBlock.id]: BoxBlock,
  [CheckboxBlock.id]: CheckboxBlock,
  [HeaderBarBlock.id]: HeaderBarBlock,
  [Heading1Block.id]: Heading1Block,
  [Heading2Block.id]: Heading2Block,
  [Heading3Block.id]: Heading3Block,
  [Heading4Block.id]: Heading4Block,
  [Heading5Block.id]: Heading5Block,
  [Heading6Block.id]: Heading6Block,
  [HeroBlock.id]: HeroBlock,
  [ImageBlock.id]: ImageBlock,
  [InputBlock.id]: InputBlock,
  [SwitchBlock.id]: SwitchBlock,
  [TextBlock.id]: TextBlock,
  [WriteBlock.id]: WriteBlock,
  [IconBlock.id]: IconBlock,
  [SidebarBlock.id]: SidebarBlock,
  [TableBlock.id]: TableBlock,
  [SelectBlock.id]: SelectBlock,
};
