import React from 'react';
import styled from 'styled-components';
import { TouchableOpacity } from 'react-native';

import Layout from './Layout';

interface ButtonProps {
  onPress: () => void | Promise<void>;
  label?: string;
  icon?: string;
  active?: boolean;
}

const Button: React.FC<ButtonProps> = (props) => {
  const { label, icon, active, onPress } = props;

  return (
    <TouchableOpacity onPress={onPress}>
      <ButtonView active={active}>
        {!!icon && <ButtonIcon name={icon} size={15} />}
        {!!label && <ButtonText>{label}</ButtonText>}
      </ButtonView>
    </TouchableOpacity>
  );
};

export default Button;

const ButtonView = styled.View<{ active?: boolean }>((p) => ({
  borderRadius: 4,
  backgroundColor: p.active
    ? p.theme.colors.primaryDark
    : p.theme.colors.inputBackground,
  shadowColor: 'rgba(0,0,0,0.2)',
  shadowOpacity: '1',
  padding: 8,
  borderWidth: 1,
  borderColor: p.theme.colors.divider,
}));

const ButtonText = styled.Text((p) => ({
  fontSize: 16,
  color: p.theme.colors.text,
}));

const ButtonIcon = styled(Layout.Icon)((p) => ({
  flex: 1,
  color: p.theme.colors.text,
}));
