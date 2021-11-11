import * as React from 'react';
import styled from 'styled-components';

import {
  Button,
  Grid,
  InputField,
  Spacer,
  Stack,
  Text,
  mediaQuery,
  textStyles,
} from '../system';
import { GitHubIcon } from '../components/Icons';
import { Layout } from '../components/Layout';
import { Packages } from '../components/Packages';

import logoSrc from '../assets/logo.svg';
import sketchSrc from '../assets/sketch.svg';
import figmaSrc from '../assets/figma.svg';
import xdSrc from '../assets/xd.svg';

const preventTextRunt = (text: string) => text.replace(/ /g, '\u00a0');

const features = [
  {
    name: 'Vectors',
  },
  {
    name: 'Gradients',
  },
  {
    name: 'Text Styles',
  },
  {
    name: 'Quick Measure',
  },
  {
    name: 'Fills',
  },
  {
    name: 'Shadows',
  },
  {
    name: 'Components',
  },
  {
    name: 'Smart Snap',
  },
];

export default function App() {
  return (
    <Layout>
      <Spacer size="1rem" />

      <Stack
        as="header"
        gridColumn="1 / -1"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Stack
          as="img"
          src={logoSrc}
          alt="logo"
          height="var(--header-icon-size)"
        />
        <Stack as="nav" flexDirection="row" gap={8}>
          <Stack as="a" href="https://github.com/noya-app/noya">
            <GitHubIcon />
          </Stack>
        </Stack>
      </Stack>

      <Spacer
        css={{
          minHeight: '6rem',
          [mediaQuery.medium]: {
            minHeight: '8rem',
          },
        }}
      />

      <Grid
        gridColumn="1 / -1"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="1rem"
        alignItems="center"
        css={{
          rowGap: '4rem',
          [mediaQuery.medium]: {
            rowGap: '1rem',
          },
        }}
      >
        <Stack
          alignItems="center"
          css={{
            gridColumn: '2 / span 10',
            textAlign: 'center',
            [mediaQuery.medium]: {
              alignItems: 'start',
              gridColumn: '1 / span 6',
              textAlign: 'left',
            },
          }}
        >
          <Text variant="heading1">
            Build Your Own <br /> <Text variant="mark">Design Tool</Text>
          </Text>
          <Spacer size="2rem" />
          <Text variant="body1" width="32ch">
            Noya is an ecosystem of design utilities to help with your next
            project.
          </Text>
          <Spacer size="4rem" />
          <Button>Open App</Button>
        </Stack>

        <Stack
          alignItems="center"
          justifyContent="center"
          minHeight="24rem"
          background="rgb(141, 47, 216)"
          css={{
            gridColumn: '1 / -1',
            [mediaQuery.medium]: {
              gridColumn: '7 / span 6',
              minHeight: '40rem',
            },
          }}
        >
          Demo Here
        </Stack>
      </Grid>

      <Spacer size="24rem" />

      <Grid
        gridColumn="1 / -1"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="1rem"
        css={{
          rowGap: '6rem',
          [mediaQuery.medium]: {
            rowGap: '1rem',
          },
        }}
      >
        <Grid
          gridColumn="1 / -1"
          gridTemplateColumns="repeat(2, 1fr)"
          alignItems="end"
          css={{
            gridRow: '2',
            gap: '4rem',
            [mediaQuery.medium]: {
              gridRow: '1',
              gridColumn: '1 / span 6',
              gap: '1rem',
            },
          }}
        >
          {features.map((feature) => (
            <Stack
              key={feature.name}
              alignItems="center"
              css={{
                [mediaQuery.medium]: {
                  flexDirection: 'row',
                },
              }}
            >
              <Text variant="body1">{feature.name}</Text>
            </Stack>
          ))}
        </Grid>

        <Stack
          gap="2rem"
          gridColumn="2 / span 10"
          css={{
            gridRow: '1',
            textAlign: 'center',
            [mediaQuery.medium]: {
              gridColumn: '7 / span 6',
              textAlign: 'left',
            },
          }}
        >
          <Text variant="heading2">
            All Of The Features <br /> You’re Used To <br />
            <Text variant="mark">{preventTextRunt('And More')}</Text>
          </Text>
          <Text variant="body1">
            Full-featured while delivering a system that can cater to your
            specific needs.
          </Text>
        </Stack>

        <Spacer
          size="6rem"
          css={{
            [mediaQuery.medium]: {
              minHeight: '24rem',
            },
          }}
        />

        <Stack
          alignItems="center"
          gridColumn="3 / span 8"
          css={{
            [mediaQuery.medium]: {
              gridColumn: '4 / span 6',
            },
          }}
        >
          <Text variant="heading2" alignment="center">
            Use Our Tool Or <br />
            <Text variant="mark">Build {preventTextRunt('Your Own')}</Text>
          </Text>
          <Spacer size="2rem" />
          <Text variant="body1" alignment="center">
            Noya is built on a modular set of packages that can be used on their
            own or altogether in our featured app.
          </Text>
        </Stack>
      </Grid>

      <Spacer size="6rem" />

      <Packages />

      <Spacer size="24rem" />

      <Grid
        gridColumn="1 / -1"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="1rem"
        alignItems="center"
        css={{
          rowGap: '6rem',
          [mediaQuery.medium]: {
            rowGap: '1rem',
          },
        }}
      >
        <Grid
          gridColumn="1 / -1"
          gridTemplateColumns="repeat(3, 1fr)"
          alignItems="center"
          justifyItems="center"
          css={{
            gridRow: '2',
            gap: '2rem',
            [mediaQuery.medium]: {
              gridRow: '1',
              gridColumn: '1 / span 5',
              gap: '1rem',
            },
          }}
        >
          {[
            { name: 'Sketch', source: sketchSrc },
            { name: 'Figma', source: figmaSrc },
            { name: 'XD', source: xdSrc },
          ].map(({ name, source }, index) => (
            <>
              <img
                src={source}
                alt={name}
                css={{
                  gridColumn: index + 1,
                  gridRow: 1,
                  height: '10rem',
                  opacity: name === 'Sketch' ? undefined : 0.5,
                  [mediaQuery.medium]: {
                    height: '8rem',
                  },
                }}
              />
              {name === 'Sketch' ? null : (
                <Text css={{ gridColumn: index + 1, gridRow: 2 }}>
                  Coming Soon
                </Text>
              )}
            </>
          ))}
        </Grid>

        <Stack
          gap="2rem"
          gridColumn="2 / span 10"
          css={{
            gridRow: '1',
            textAlign: 'center',
            [mediaQuery.medium]: {
              gridColumn: '7 / span 6',
              textAlign: 'left',
            },
          }}
        >
          <Text variant="heading2">
            Import and Export <br />
            <Text variant="mark">{preventTextRunt('To Multiple Tools')}</Text>
          </Text>
          <Text variant="body1">
            Import design files from Sketch, and soon Figma, and Adobe XD.
          </Text>
        </Stack>
      </Grid>

      <Spacer size="24rem" />

      <Stack alignItems="center" gridColumn="1 / -1">
        <Text variant="heading2" css={{ ...textStyles.mark, fontSize: '5rem' }}>
          Open Source
        </Text>
        <Spacer
          size="2rem"
          css={{
            [mediaQuery.medium]: {
              minHeight: '4rem',
            },
          }}
        />
        <Text
          variant="body1"
          alignment="center"
          css={{
            fontSize: '3rem',
            width: '24ch',
            [mediaQuery.medium]: {
              width: '40ch',
            },
          }}
        >
          The core library is completely free and we are committed to creating a
          rich ecosystem for designers and developers.
        </Text>
      </Stack>

      <Spacer size="24rem" />

      <Grid
        gridTemplateColumns="repeat(12, 1fr)"
        gap="1rem"
        css={{
          gridColumn: '1 / -1 !important',
          rowGap: '4rem',
          [mediaQuery.medium]: {
            rowGap: '1rem',
          },
        }}
      >
        <Stack
          gap="2rem"
          css={{
            gridColumn: '1 / span 12',
            gridRow: '1',
            alignItems: 'center',
            textAlign: 'center',
            [mediaQuery.medium]: {
              gridColumn: '2 / span 4',
              textAlign: 'left',
              alignItems: 'start',
            },
          }}
        >
          <Text variant="heading2">
            Meet the <br />
            <Text variant="mark">Contributors</Text>
          </Text>
          <Text variant="body1" width="24ch">
            Noya wouldn’t be possible without an amazing community.
          </Text>
          <Spacer size="0.5rem" />
          <Button>Get started contributing</Button>
        </Stack>

        <Stack
          flexDirection="row"
          alignItems="center"
          gridColumn="1 / span 12"
          gap="4rem"
          css={{
            position: 'relative',
            overflow: 'auto',
            scrollSnapType: 'x mandatory',
            paddingLeft: 'calc(50vw - 50px)',
            paddingBottom: '30px',
            /** Hide horizontal scrollbar on mobile. */
            clipPath: 'inset(0 0 30px 0)',
            [mediaQuery.medium]: {
              paddingLeft: 0,
              gridColumn: '6 / span 7',
            },
          }}
        >
          <OverflowGradient />
          {['Devin', 'Travis', 'Maria', 'Leanne'].map((contributor) => (
            <div
              key={contributor}
              css={{
                width: 100,
                height: 100,
                flexShrink: 0,
                background: '#be6dff',
                borderRadius: '100%',
              }}
            />
          ))}
          {/* Add space to the end of the scroll container */}
          <div css={{ flex: '0 0 1rem' }} />
        </Stack>
      </Grid>

      <Spacer size="24rem" />

      <Stack gridColumn="1 / -1" alignItems="center">
        <Text variant="heading2">Stay In Touch</Text>
        <Spacer size="2rem" />
        <Text
          variant="body1"
          alignment="center"
          css={{
            width: '24ch',
            [mediaQuery.medium]: {
              // width: '40ch',
            },
          }}
        >
          Get updates on the lastest releases and new features.
        </Text>
        <Spacer size="4rem" />
        <Stack flexDirection="row">
          <InputField />
          <Button
            css={{
              borderTopLeftRadius: '0 !important',
              borderBottomLeftRadius: '0 !important',
            }}
          >
            Sign Up
          </Button>
        </Stack>
      </Stack>

      <Spacer size="24rem" />
    </Layout>
  );
}

const OverflowGradient = styled.div({
  display: 'none',
  [mediaQuery.medium]: {
    display: 'block',
    position: 'sticky',
    top: 0,
    left: 0,
    width: 32,
    height: '100%',
    flexShrink: 0,
    background: 'linear-gradient(to left,rgb(45 14 70 / 0%),rgb(45 14 70))',
  },
});
