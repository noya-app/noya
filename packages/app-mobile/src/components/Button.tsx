import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

interface ButtonProps {
  onPress: () => void | Promise<void>;
  label: string;
}

const Button: React.FC<ButtonProps> = (props) => {
  const { label, onPress } = props;

  return (
    <TouchableOpacity onPress={onPress}>
      <ButtonView>
        <ButtonText>{label}</ButtonText>
      </ButtonView>
    </TouchableOpacity>
  );
};

export default Button;

const ButtonView = styled.View((p) => ({
  borderRadius: 4,
  backgroundColor: p.theme.colors.inputBackground,
  shadowOffset: { width: 0, height: 4 },
  shadowColor: 'rgba(0,0,0,0.2)',
  shadowOpacity: `1`,
  padding: 8,
  borderWidth: 1,
  borderColor: p.theme.colors.divider,
}));

const ButtonText = styled.Text((p) => ({
  fontSize: 16,
  color: p.theme.colors.text,
}));
