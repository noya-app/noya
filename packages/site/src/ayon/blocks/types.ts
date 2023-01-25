import { BlockProps, InferBlockProps } from 'noya-state';
import { ReactNode } from 'react';

export type BlockDefinition = {
  id: string;
  infer: (props: InferBlockProps) => number;
  render: (props: BlockProps) => ReactNode;
};
