import React from 'react';
import { View } from 'react-native';

import { QueueProps } from './types';

const Queue: React.FC<QueueProps> = (props) => {
  const { size } = props;

  const width =
    typeof size !== 'string'
      ? size
      : {
          small: 5,
          medium: 10,
          large: 15,
        }[size];

  return <View style={{ width }} />;
};

export default React.memo(Queue);
