import React from 'react';
import { View } from 'react-native';

interface QueueProps {
  size: 'small' | 'medium' | 'large';
}

const Queue: React.FC<QueueProps> = (props) => {
  const { size } = props;

  const width = {
    small: 5,
    medium: 10,
    large: 15,
  }[size];

  return <View style={{ width }} />;
};

export default Queue;
