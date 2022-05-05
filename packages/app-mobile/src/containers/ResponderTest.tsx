import React, { memo } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components';

import ResponderView from '../components/ResponderView';

const ResponderTest = () => {
  return (
    <Responder>
      <InnerContainer>
        <Label>Placeholder text</Label>
      </InnerContainer>
    </Responder>
  );
};

const Responder = styled(ResponderView)({
  flex: 1,
});

const InnerContainer = styled(View)({
  flex: 1,
  padding: 20,
});

const Label = styled(Text)(({ theme }) => ({
  ...theme.textStyles.subtitle,
  color: theme.colors.text,
}));

export default memo(ResponderTest);
