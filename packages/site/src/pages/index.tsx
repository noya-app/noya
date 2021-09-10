import * as React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import {
  Grid,
  Stack,
  Text,
  Spacer,
  mediaQuery,
  textStyles,
  cssVariables,
} from '../system';
import { PagerView, View } from '../components/PagerView';
import logoSrc from '../assets/logo.svg';
import blurOneSrc from '../assets/blur-1.svg';
import waveSrc from '../assets/wave.svg';

const preventTextOprhan = (text: string) => text.replace(/ /g, '\u00a0');

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

const GlobalStyles = createGlobalStyle({
  ':root': cssVariables,
  '*': {
    boxSizing: 'border-box',
  },
  html: {
    fontSize: '40%',
    [mediaQuery.medium]: {
      fontSize: '56%',
    },
    [mediaQuery.large]: {
      fontSize: '72%',
    },
    [mediaQuery.xlarge]: {
      fontSize: '100%',
    },
  },
  body: {
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    background: '#2d0e46',
    color: 'white',
  },
  '#root': {
    width: '100%',
    minHeight: '100vh',
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  const [showGridDebug, setShowGridDebug] = React.useState(false);
  const columns = 12;
  const maxWidth = '1440px';

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'g') {
        setShowGridDebug((bool) => !bool);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <GlobalStyles />
      <Grid>
        <Grid
          gridTemplateColumns={`minmax(2rem, 1fr) minmax(auto, ${maxWidth}) minmax(2rem, 1fr)`}
          css={{
            gridArea: '1 / 1 / 1 / 1',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundImage: `url(${blurOneSrc}), url(${waveSrc})`,
            backgroundPosition: 'center top, center 110rem',
            backgroundSize: '60rem auto, max(600px, 100vw) auto',
            '> *': {
              gridColumn: 2,
              zIndex: 1,
            },
            [mediaQuery.medium]: {
              backgroundPosition: '70% top, center 70rem',
            },
          }}
        >
          {children}
        </Grid>
        <Grid
          css={{
            justifySelf: 'center',
            width: '100%',
            maxWidth: maxWidth,
            gridArea: '1 / 1 / 1 / 1',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridGap: '1rem',
            backgroundSize: '100% 1rem',
            backgroundImage:
              'linear-gradient(to bottom, #25cef4 0px, transparent 1px)',
            pointerEvents: 'none',
            opacity: showGridDebug ? 1 : 0,
          }}
        >
          {Array(columns)
            .fill(0)
            .map((_, index) => (
              <div key={index} style={{ background: '#b6fcff6e' }} />
            ))}
        </Grid>
      </Grid>
    </>
  );
}

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
            minHeight: '1rem',
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
          gap="2rem"
          css={{
            gridColumn: '2 / span 10',
            textAlign: 'center',
            [mediaQuery.medium]: {
              gridColumn: '1 / span 6',
              textAlign: 'left',
            },
          }}
        >
          <Text variant="heading1">
            Build Your Own <br /> <Text variant="mark">Design Tool</Text>
          </Text>
          <Text variant="body1">
            Noya is an ecosystem of design utilities to help with your next
            project.
          </Text>
        </Stack>

        <Stack
          alignItems="center"
          justifyContent="center"
          minHeight="24rem"
          // @ts-ignore
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

      <Spacer size="12rem" />

      <Grid
        gridColumn="1 / -1"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="1rem"
        css={{
          rowGap: '4rem',
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
            <Text variant="mark">{preventTextOprhan('And More')}</Text>
          </Text>
          <Text variant="body1">
            Full-featured while delivering a system that can cater to your
            specific needs.
          </Text>
        </Stack>

        <Spacer size="12rem" />

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
            <Text variant="mark">Build {preventTextOprhan('Your Own')}</Text>
          </Text>
          <Spacer size="2rem" />
          <Text variant="body1" alignment="center">
            Noya is built on a modular set of packages that can be used on their
            own or altogether in our featured app.
          </Text>
          <Spacer size="4rem" />
        </Stack>
      </Grid>

      <Packages />

      <Spacer size="12rem" />

      <Grid
        gridColumn="1 / -1"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="1rem"
        css={{
          rowGap: '4rem',
          [mediaQuery.medium]: {
            rowGap: '1rem',
          },
        }}
      >
        <Grid
          gridColumn="1 / -1"
          gridTemplateColumns="repeat(3, 1fr)"
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
          {['Sketch', 'Figma', 'XD'].map((name) => (
            <Stack
              key={name}
              alignItems="center"
              css={{
                [mediaQuery.medium]: {
                  flexDirection: 'row',
                },
              }}
            >
              <Text variant="body1">{name}</Text>
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
            Import and Export <br />
            <Text variant="mark">{preventTextOprhan('To Multiple Tools')}</Text>
          </Text>
          <Text variant="body1">
            Import design files from Sketch, Figma, and Adobe XD.
          </Text>
        </Stack>
      </Grid>

      <Spacer size="12rem" />

      <Stack alignItems="center" gridColumn="1 / -1">
        <Text variant="heading2" css={textStyles.mark}>
          Open Source
        </Text>
        <Spacer size="2rem" />
        <Text variant="body1" alignment="center" width="40ch">
          The core library is completely free and we are committed to creating a
          rich ecosystem for designers and developers.
        </Text>
      </Stack>

      <Spacer size="12rem" />

      <Grid
        gridColumn="1 / -1"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="1rem"
        css={{
          rowGap: '4rem',
          [mediaQuery.medium]: {
            rowGap: '1rem',
          },
        }}
      >
        <Stack
          gap="2rem"
          // gridColumn="2 / span 10"
          css={{
            gridRow: '1',
            textAlign: 'center',
            [mediaQuery.medium]: {
              gridColumn: '1 / span 5',
              textAlign: 'left',
            },
          }}
        >
          <Text variant="heading2">
            Meet the <br />
            <Text variant="mark">{preventTextOprhan('Contributors')}</Text>
          </Text>
          <Text variant="body1" width="24ch">
            Noya wouldn’t be possible without these amazing people
          </Text>
        </Stack>

        <Stack
          flexDirection="row"
          alignItems="center"
          gridColumn="6 / span 7"
          gap="4rem"
        >
          {['Devin', 'Travis', 'Maria', 'Leanne'].map((contributor) => (
            <div key={contributor}>{contributor}</div>
          ))}
        </Stack>
      </Grid>

      <Spacer size="12rem" />
    </Layout>
  );
}

function GitHubIcon() {
  return (
    <Stack
      as="svg"
      viewBox="0 0 40 40"
      fill="none"
      css={{ height: 'var(--header-icon-size)' }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9987 2.26685C10.2075 2.26685 2.26697 10.2063 2.26697 20.0008C2.26697 27.8346 7.34764 34.4818 14.3944 36.8279C15.2816 36.99 15.6049 36.4423 15.6049 35.9722C15.6049 35.5508 15.5897 34.4362 15.581 32.9567C10.6484 34.0279 9.60765 30.5791 9.60765 30.5791C8.80095 28.5303 7.63831 27.9847 7.63831 27.9847C6.0282 26.8852 7.76023 26.9071 7.76023 26.9071C9.54015 27.0322 10.4764 28.7348 10.4764 28.7348C12.0582 31.4444 14.6274 30.6618 15.6376 30.2079C15.7987 29.0626 16.257 28.281 16.7632 27.8378C12.8256 27.3892 8.68556 25.8685 8.68556 19.0733C8.68556 17.1366 9.37685 15.5548 10.5112 14.3148C10.3283 13.8663 9.71978 12.0635 10.6854 9.62168C10.6854 9.62168 12.1735 9.14486 15.5614 11.4386C16.9755 11.0456 18.4931 10.8497 20.0008 10.842C21.5075 10.8497 23.024 11.0456 24.4403 11.4386C27.826 9.14486 29.3118 9.62168 29.3118 9.62168C30.2798 12.0635 29.6713 13.8663 29.4894 14.3148C30.626 15.5548 31.3118 17.1366 31.3118 19.0733C31.3118 25.8859 27.1652 27.385 23.2156 27.8236C23.8514 28.3714 24.4185 29.4535 24.4185 31.1082C24.4185 33.478 24.3968 35.3908 24.3968 35.9722C24.3968 36.4468 24.7168 36.9988 25.616 36.8255C32.6574 34.4754 37.7337 27.8335 37.7337 20.0008C37.7337 10.2063 29.7932 2.26685 19.9987 2.26685Z"
        fill="white"
      />
    </Stack>
  );
}

const StyledPagerView = styled(PagerView)({
  gridColumn: '1 / -1 !important',
});

// TODO: grep packages directory and generate from package.json name + description
function Packages() {
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
      {colors.map((color, index) => (
        <View key={index} color={color} />
      ))}
    </StyledPagerView>
  );
}

// function Package({
//   heading,
//   content,
//   active,
//   setIndex,
// }: {
//   heading: string;
//   content: string;
//   active?: boolean;
//   setIndex?: () => void;
// }) {
//   return (
//     <Stack
//       axis="y"
//       width="32rem"
//       padding="4rem"
//       gap="2rem"
//       background="rgba(255,255,255,0.1)"
//       onClick={setIndex}
//       style={{
//         flexShrink: 0,
//         borderRadius: '2rem',
//         transform: active ? undefined : 'scale(0.85)',
//       }}
//     >
//       <Text variant="heading3">{heading}</Text>
//       <Text variant="body1">{content}</Text>
//     </Stack>
//   );
// }
