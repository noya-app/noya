import React from 'react';
import { Text } from 'react-native';

interface MainMenuProps {}

const MainMenu: React.FC<MainMenuProps> = (props) => {
  return (
    <>
      <Text style={{ color: '#fff' }}>Main Menu</Text>
    </>
  );
};

export default MainMenu;
