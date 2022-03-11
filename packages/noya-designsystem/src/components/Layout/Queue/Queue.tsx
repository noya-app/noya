import { memo } from 'react';
import styled from 'styled-components';

import { QueueProps } from './types';

const Queue = styled.div<QueueProps>(({ size }) => ({
  width:
    typeof size !== 'string'
      ? size
      : {
          small: 5,
          medium: 10,
          large: 15,
        }[size],
}));

export default memo(Queue);
