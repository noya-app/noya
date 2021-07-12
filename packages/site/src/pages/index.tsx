import { ThemeProvider } from 'styled-components';
import { Stack, Text, Spacer, siteTheme } from 'noya-designsystem';

function App() {
  return (
    <ThemeProvider theme={siteTheme}>
      <Stack
        axis="y"
        width="100%"
        minHeight="100vh"
        paddingX="10rem"
        paddingY="6rem"
      >
        <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <span>Noya</span>
          <span style={{ justifySelf: 'end' }}>GitHub</span>
        </header>

        <Spacer.Vertical size="8rem" />

        <Stack axis="x" spacing="6rem">
          <Stack axis="y" distribution="fill">
            <svg width="100px" viewBox="0 0 100 100">
              <rect width="300" height="100" fill="#E0BCFF" />
            </svg>
            <svg width="100px" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#C388F5" />
            </svg>
            <svg width="100px" viewBox="0 0 100 80">
              <polygon points="0,80 50,0 100,80" fill="#9C2FF1" />
            </svg>
          </Stack>
          <Text variant="heading1">
            Open
            <br />
            Source
            <br />
            Design
          </Text>
        </Stack>

        <Spacer.Vertical size="12rem" />

        <Stack as="section" axis="x">
          <div
            style={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: '1fr 1fr',
              gridGap: '8rem',
            }}
          >
            <Text variant="heading2">
              Build your own <Text variant="mark">design tool</Text>
            </Text>
            <Text variant="body1">
              Noya is a rich ecosystem for building design tools. Backed by a
              powerful GraphQL API, your design and code always stay in sync.
            </Text>
          </div>
        </Stack>

        <Spacer.Vertical size="8rem" />

        <Stack as="section" axis="x">
          <div
            style={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: '1fr 1fr',
              gridGap: '8rem',
            }}
          >
            <Text variant="heading2">
              Import and export to <Text variant="mark">mulitple tools</Text>
            </Text>
            <Text variant="body1">
              Import design files from Sketch, Figma, and Adobe XD.
            </Text>
          </div>
        </Stack>

        <Spacer.Vertical size="8rem" />

        <Stack as="section" axis="x">
          <div
            style={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: '1fr 1fr',
              gridGap: '8rem',
            }}
          >
            <Text variant="heading2">
              Plugins for <Text variant="mark">everything</Text>
            </Text>
            <Text variant="body1">
              Built on an interoperable system of plugins, developers can hook
              into any part of the design lifecycle.
            </Text>
          </div>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}

export default App;
