import React, { memo } from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

interface ThemeManagerProps {}

const ThemeManager: React.FC<ThemeManagerProps> = (props) => {
  return (
    <>
      <Text style={{ color: '#fff' }}>Theme Manager</Text>
    </>
  );
};

export default ThemeManager;
