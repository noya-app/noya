import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { signInSymbol } from './symbols';

export const SignInBlock: BlockDefinition = {
  editorVersion: 2,
  symbol: signInSymbol,
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === signInSymbol.symbolID)
    ) {
      return 0;
    }

    return 0.1;
  },
  render: (env, props) => renderStack(env, { props, block: SignInBlock }),
};
