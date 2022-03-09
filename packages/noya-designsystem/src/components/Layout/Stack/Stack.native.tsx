import React from 'react';
import { View } from 'react-native';

import { StackProps } from './types';

const Stack: React.FC<StackProps> = (props) => {
  const { size } = props;

  const height =
    typeof size !== 'string'
      ? size
      : {
          small: 5,
          medium: 10,
          large: 15,
        }[size];

  return <View style={{ height }} />;
};

export default React.memo(Stack);
