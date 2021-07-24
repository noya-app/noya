import { ThemeProvider } from 'styled-components';
import { Stack, Text, Spacer, siteTheme } from 'noya-designsystem';
import Logo from '../assets/logo.svg';

function App() {
  return (
    <ThemeProvider theme={siteTheme}>
      <Stack axis="y" width="100%" paddingX="10rem" paddingY="6rem">
        <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <Logo width="100px" />
          <span style={{ justifySelf: 'end' }}>
            <Stack as="nav" axis="x" spacing={8}>
              <Text variant="link">Team</Text>
              <Text>GitHub</Text>
            </Stack>
          </span>
        </header>

        <Spacer.Vertical size="4rem" />

        <Stack axis="x" spacing="6rem">
          <Stack axis="y" distribution="fill" style={{ '--width': 100 }}>
            <svg style={{ width: 'var(--width)' }} viewBox="0 0 100 100">
              <rect width="300" height="100" fill="#E0BCFF" />
            </svg>
            <svg style={{ width: 'var(--width)' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#C388F5" />
            </svg>
            <svg style={{ width: 'var(--width)' }} viewBox="0 0 100 80">
              <polygon points="0,80 50,0 100,80" fill="#9C2FF1" />
            </svg>
          </Stack>
          <Text variant="heading1">
            <Text variant="bodyAlternate">Design.</Text>
            <br />
            Open
            <br />
            Sourced.
          </Text>
        </Stack>

        <Spacer.Vertical size="4rem" />

        <Text variant="body1" width="80ch">
          Noya is a rich ecosystem of utilities for building design tools.{' '}
          <br /> Backed by a powerful GraphQL API, your design and code always
          stay in sync.
        </Text>

        <Spacer.Vertical size="12rem" />

        <Stack axis="x" spacing="2rem">
          <Stack axis="y" alignment="center">
            <Text variant="heading3">Editor</Text>
            <Text alignment="center">
              The full power of the design tools you're used to. Packed with a
              ton of <a href="#features">features</a>.
            </Text>
          </Stack>

          <Stack axis="y" alignment="center">
            <Text variant="heading3">GraphQL</Text>
            <Text alignment="center">
              The full power of the design tools you're used to. Packed with a
              ton of [features](/#canvas-features).
            </Text>
          </Stack>

          <Stack axis="y" alignment="center">
            <Text variant="heading3">SVG Export</Text>
            <Text alignment="center">
              Export designs to SVG from Figma, Sketch, and AdobeXD.
            </Text>
          </Stack>

          <Stack axis="y" alignment="center">
            <Text variant="heading3">Canvas</Text>
            <Text alignment="center">
              Built on Canvas. The full power of the design tools you're used
              to. Packed with a ton of [features](/#canvas-features).
            </Text>
          </Stack>
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
