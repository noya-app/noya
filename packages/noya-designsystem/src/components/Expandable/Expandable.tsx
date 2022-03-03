import React, { memo } from 'react';

import { ExpandableProps } from './types';

export const ExpandableComponent: React.FC<ExpandableProps> = () => {
  throw new Error('Expandable.tsx not implemented!');
};

export const Expandable = memo(ExpandableComponent);
