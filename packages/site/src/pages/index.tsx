import styled, { ThemeProvider } from 'styled-components';
import { Button, darkTheme } from 'noya-designsystem';
import Logo from '../assets/logo.svg';
import { Heading, Stack } from '../components/ui';
import React from 'react';

const LogoWrapper = styled.div({
  '* >': { height: '32px' },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Stack
        axis="y"
        width="100%"
        height="100vh"
        padding="10rem"
        background="black"
      >
        <Button id="hi">Hi</Button>
        <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <LogoWrapper>
            <Logo />
          </LogoWrapper>
          <span style={{ justifySelf: 'end' }}>GitHub</span>
        </header>
        <Heading level={1}>
          Open
          <br />
          Source
          <br />
          Design
        </Heading>
        {/* <p>Noya is an open-source toolkit to build your own design tool.</p> */}
        {/* <p>An open-source toolkit to build your own design tool.</p> */}

        <Stack axis="x" paddingY={48}>
          <Heading level={2}>Build your own design tool</Heading>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}

export default App;
