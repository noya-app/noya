import React, { memo } from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

interface MainMenuProps {}

const MainMenu: React.FC<MainMenuProps> = (props) => {
  return (
    <>
      <Text style={{ color: '#fff' }}>Main Menu</Text>
    </>
  );
};

export default MainMenu;
