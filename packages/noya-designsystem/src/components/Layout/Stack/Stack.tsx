import { memo } from 'react';
import styled from 'styled-components';

import { StackProps } from './types';

const Stack = styled.div<StackProps>(({ size }) => {
  if (size) {
    return {
      height:
        typeof size !== 'string'
          ? size
          : {
              small: 5,
              medium: 10,
              large: 15,
            }[size],
    };
  }

  return { flex: 1 };
});

export default memo(Stack);
