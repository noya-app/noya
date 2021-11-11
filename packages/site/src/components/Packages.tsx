import * as React from 'react';
import styled from 'styled-components';

import { Grid, Text } from '../system';
import { GitHubIcon } from './Icons';
import { PagerView, View } from './PagerView';

// TODO: grep packages directory and generate from package.json name + description
export function Packages() {
  const colors = [
    '#8d2fd8',
    '#be6dff',
    '#8d2fd8',
    '#be6dff',
    '#8d2fd8',
    '#be6dff',
    '#8d2fd8',
    '#be6dff',
    '#8d2fd8',
    '#be6dff',
    '#8d2fd8',
    '#be6dff',
  ];
  return (
    <StyledPagerView>
      {colors.map((_, index) => (
        <View key={index}>
          <Grid
            padding="3rem"
            gap="2rem"
            css={{
              margin: '2rem',
              borderRadius: '2rem',
              background: 'rgba(255,255,255,0.1)',
              userSelect: 'none',
            }}
          >
            <Text variant="heading3" css={{ gridRow: '1', lineHeight: '1' }}>
              App
            </Text>
            <a
              href="/"
              css={{
                '--header-icon-size': '3rem',
                gridRow: '1',
                placeSelf: 'center end',
              }}
            >
              <GitHubIcon />
            </a>
            <Text variant="body1" css={{ gridColumn: '1 / span 2' }}>
              A full featured design application built using Noya packages.
            </Text>
          </Grid>
        </View>
      ))}
    </StyledPagerView>
  );
}

const StyledPagerView = styled(PagerView)({
  gridColumn: '1 / -1 !important',
});
