import React, { memo } from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

interface PageListProps {}

const PageList: React.FC<PageListProps> = (props) => {
  return (
    <>
      <Text style={{ color: '#fff' }}>Page List</Text>
    </>
  );
};

export default PageList;
