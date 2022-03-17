import { memo } from 'react';
import styled from 'styled-components';

import { QueueProps } from './types';

const Queue = styled.div<QueueProps>(({ size }) => {
  if (size) {
    return {
      width:
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

export default memo(Queue);
