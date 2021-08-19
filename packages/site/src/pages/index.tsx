import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { Grid, Stack, Text, Spacer } from 'noya-designsystem';
import {
  motion,
  useTransform,
  useElementScroll,
  useViewportScroll,
} from 'framer-motion';
import logoSrc from '../assets/logo.svg';
import * as theme from '../theme';

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

export default function App() {
  return (
    // @ts-ignore
    <ThemeProvider theme={theme}>
      <Stack axis="y" width="100%" paddingX="10rem" paddingY="6rem">
        <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <img src={logoSrc} alt="logo" width="100px" />
          <span style={{ justifySelf: 'end' }}>
            <Stack as="nav" axis="x" gap={8}>
              <GitHubIcon />
            </Stack>
          </span>
        </header>

        <Spacer.Vertical size="4rem" />

        <Stack axis="x" justifyContent="fill">
          <Stack axis="y" gap="2rem">
            <Text variant="heading1">
              Build Your Own <Text variant="mark">Design Tool</Text>
            </Text>
            <Text variant="body1" width="24ch">
              Noya is an ecosystem of design utilities to help with your next
              project.
            </Text>
          </Stack>
          <Stack axis="y" alignItems="center" justifyContent="center">
            Demo Here
          </Stack>
        </Stack>

        <Spacer.Vertical size="12rem" />

        <Stack axis="x" alignItems="center" justifyContent="fill" gap="2rem">
          <Grid columns="1fr 1fr" gap="1rem">
            {features.map((feature) => (
              <Stack key={feature.name} axis="x" padding="1rem">
                <Text variant="body1">{feature.name}</Text>
              </Stack>
            ))}
          </Grid>
          <Stack axis="y" gap="2.5rem">
            <Text variant="heading2">
              All Of The Features You’re Used To{' '}
              <Text variant="mark">{preventTextOprhan('And More')}</Text>
            </Text>
            <Text variant="body1">
              Full-featured while delivering a system that can cater to your
              specific needs.
            </Text>
          </Stack>
        </Stack>

        <Spacer.Vertical size="12rem" />

        <Stack axis="y" alignItems="center">
          <Text variant="heading2" align="center" width="12ch">
            Use Our Tool Or{' '}
            <Text variant="mark">Build {preventTextOprhan('Your Own')}</Text>
          </Text>
          <Spacer.Vertical size="2.5rem" />
          <Text variant="body1" align="center" width="32ch">
            Noya is built on a modular set of packages that can be used on their
            own or altogether in our featured app.
          </Text>
          <Spacer.Vertical size="6rem" />
          <Features>
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
            <Feature
              heading="App"
              content="A full featured design application built on Noya utilities."
            />
          </Features>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9987 2.26685C10.2075 2.26685 2.26697 10.2063 2.26697 20.0008C2.26697 27.8346 7.34764 34.4818 14.3944 36.8279C15.2816 36.99 15.6049 36.4423 15.6049 35.9722C15.6049 35.5508 15.5897 34.4362 15.581 32.9567C10.6484 34.0279 9.60765 30.5791 9.60765 30.5791C8.80095 28.5303 7.63831 27.9847 7.63831 27.9847C6.0282 26.8852 7.76023 26.9071 7.76023 26.9071C9.54015 27.0322 10.4764 28.7348 10.4764 28.7348C12.0582 31.4444 14.6274 30.6618 15.6376 30.2079C15.7987 29.0626 16.257 28.281 16.7632 27.8378C12.8256 27.3892 8.68556 25.8685 8.68556 19.0733C8.68556 17.1366 9.37685 15.5548 10.5112 14.3148C10.3283 13.8663 9.71978 12.0635 10.6854 9.62168C10.6854 9.62168 12.1735 9.14486 15.5614 11.4386C16.9755 11.0456 18.4931 10.8497 20.0008 10.842C21.5075 10.8497 23.024 11.0456 24.4403 11.4386C27.826 9.14486 29.3118 9.62168 29.3118 9.62168C30.2798 12.0635 29.6713 13.8663 29.4894 14.3148C30.626 15.5548 31.3118 17.1366 31.3118 19.0733C31.3118 25.8859 27.1652 27.385 23.2156 27.8236C23.8514 28.3714 24.4185 29.4535 24.4185 31.1082C24.4185 33.478 24.3968 35.3908 24.3968 35.9722C24.3968 36.4468 24.7168 36.9988 25.616 36.8255C32.6574 34.4754 37.7337 27.8335 37.7337 20.0008C37.7337 10.2063 29.7932 2.26685 19.9987 2.26685Z"
        fill="white"
      />
    </svg>
  );
}

function Features({ children }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { scrollYProgress: viewportScrollYProgress } = useViewportScroll();
  const { scrollYProgress: elementScrollYProgress } = useElementScroll(ref);
  const x = useTransform(viewportScrollYProgress, [0, 1], [300, 0]);
  const scale = useTransform(elementScrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div style={{ width: '100%', overflow: 'hidden' }}>
      <motion.div
        ref={ref}
        style={{
          display: 'flex',
          // overflow: 'auto',
          // x,
        }}
      >
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child, {
            active: activeIndex === index,
            setIndex: () => setActiveIndex(index),
          }),
        )}
      </motion.div>
    </motion.div>
  );
}

function Feature({
  heading,
  content,
  active,
  setIndex,
}: {
  heading: string;
  content: string;
  active?: boolean;
  setIndex?: () => void;
}) {
  return (
    <Stack
      axis="y"
      width="32rem"
      padding="4rem"
      gap="2rem"
      background="rgba(255,255,255,0.1)"
      onClick={setIndex}
      style={{
        flexShrink: 0,
        borderRadius: '2rem',
        transform: active ? undefined : 'scale(0.85)',
      }}
    >
      <Text variant="heading3">{heading}</Text>
      <Text variant="body1">{content}</Text>
    </Stack>
  );
}
