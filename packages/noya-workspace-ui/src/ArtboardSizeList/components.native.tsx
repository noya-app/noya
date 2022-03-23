import React from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

export const Header = styled(View)((_p) => ({
  flexDirection: 'row',
  padding: 8,
  // For select dropdown to appear above thwe tree view
  zIndex: 1,
}));

export const SizeLabel = styled(Text)(({ theme }) => ({
  ...theme.textStyles.code,
  color: theme.colors.textMuted,
}));
