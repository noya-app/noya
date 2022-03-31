import React, { memo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

import Sketch from 'noya-file-format';
import { ColorPicker } from 'noya-designsystem';

interface PageListProps {}

const PageList: React.FC<PageListProps> = (props) => {
  const [color, setColor] = useState<Sketch.Color>({
    _class: 'color',
    alpha: 1,
    red: 1,
    green: 0,
    blue: 1,
  });

  // useEffect(() => {
  //   console.log(color);
  // }, [color]);

  return (
    <View>
      <ColorPicker value={color} onChange={setColor} />
    </View>
  );
};

export default PageList;
