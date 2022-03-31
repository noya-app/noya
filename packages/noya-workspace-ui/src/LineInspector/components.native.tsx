import styled from 'styled-components';
import { View, Text } from 'react-native';

export const Row = styled(View)({
  flexDirection: 'row',
  paddingHorizontal: 10,
});

export const LabelContainer = styled(Text)(({ theme }) => ({
  ...theme.textStyles.small,
  alignItems: 'center',
  flex: 0.5,
  color: theme.colors.textSubtle,
}));
