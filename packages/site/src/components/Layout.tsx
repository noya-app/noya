import * as React from 'react';
import { Grid, mediaQuery } from '../system';
import { GlobalStyles } from '../components/GlobalStyles';
import blurOneSrc from '../assets/blur-1.svg';
import waveSrc from '../assets/wave.svg';

export function Layout({ children }: { children: React.ReactNode }) {
  const columns = 12;
  const maxWidth = '1440px';
  return (
    <>
      <GlobalStyles />
      <DebugLayout columns={columns} maxWidth={maxWidth}>
        <Grid
          gridTemplateColumns={`minmax(2rem, 1fr) minmax(auto, ${maxWidth}) minmax(2rem, 1fr)`}
          css={{
            gridArea: '1 / 1 / 1 / 1',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundImage: `url(${blurOneSrc}), url(${waveSrc})`,
            backgroundPosition: 'center 4%, center 116rem',
            backgroundSize: '80rem auto, max(600px, 100vw) auto',
            '> *': {
              gridColumn: 2,
              zIndex: 1,
            },
            [mediaQuery.medium]: {
              backgroundPosition: 'calc(50% + 360px) -2%, center 100rem',
              backgroundSize: '100rem auto, max(600px, 100vw) auto',
            },
            [mediaQuery.xlarge]: {
              backgroundPosition: 'calc(50% + 360px) -2%, center 92rem',
            },
          }}
        >
          {children}
        </Grid>
      </DebugLayout>
    </>
  );
}

function DebugLayout({
  children,
  columns,
  maxWidth,
}: {
  children: React.ReactNode;
  columns: number;
  maxWidth: string;
}) {
  const [showGridDebug, setShowGridDebug] = React.useState(false);

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
    <Grid>
      {children}
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
  );
}
