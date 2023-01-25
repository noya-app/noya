import { BlockProps, InferBlockProps } from 'noya-state';
import { ReactNode } from 'react';

export type BlockDefinition = {
  infer: (props: InferBlockProps) => number;
  render: (props: BlockProps) => ReactNode;
};
