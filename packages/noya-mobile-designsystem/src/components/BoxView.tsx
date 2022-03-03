import { memo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

const BoxView = styled(View)((p) => ({
  borderRadius: 8,
  padding: p.theme.sizes.spacing.small,
  backgroundColor: p.theme.colors.sidebar.background,
}));

export default memo(BoxView);
