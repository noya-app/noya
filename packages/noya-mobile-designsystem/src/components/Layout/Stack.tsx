import React from 'react';
import { View } from 'react-native';

interface StackProps {
  size: 'small' | 'medium' | 'large';
}

const Stack: React.FC<StackProps> = (props) => {
  const { size } = props;

  const height = {
    small: 5,
    medium: 10,
    large: 15,
  }[size];

  return <View style={{ height }} />;
};

export default React.memo(Stack);
