import { ThemeProvider } from 'styled-components';
import { Button, Stack, Text, darkTheme } from 'noya-designsystem';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Stack axis="y" width="100%" height="100vh" padding="10rem">
        <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <span style={{ justifySelf: 'end' }}>GitHub</span>
        </header>
        <Text variant="heading1">
          Open
          <br />
          Source
          <br />
          Design
        </Text>
        <Button id="hi">Get Started</Button>
        {/* <p>Noya is an open-source toolkit to build your own design tool.</p> */}
        {/* <p>An open-source toolkit to build your own design tool.</p> */}

        <Stack axis="x" paddingY={48}>
          <Text variant="heading2">Build your own design tool</Text>
          <Text variant="body">
            This is an example of what <Text variant="body">nested text</Text>{' '}
            can look like.
          </Text>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}

export default App;
