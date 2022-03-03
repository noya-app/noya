import React, { memo } from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

interface AttributeInspectorProps {}

const AttributeInspector: React.FC<AttributeInspectorProps> = (props) => {
  return (
    <>
      <Text style={{ color: '#fff' }}>Attribute Inspector</Text>
    </>
  );
};

export default AttributeInspector;
