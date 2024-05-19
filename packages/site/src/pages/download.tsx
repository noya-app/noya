import {
  Button,
  Heading2,
  Heading4,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { DownloadIcon } from 'noya-icons';
import React from 'react';
import logo from '../assets/noya-icon-square.svg';
import { AppLayout } from '../components/AppLayout';
import { NavigationLinks } from '../components/NavigationLinks';
import { Toolbar } from '../components/Toolbar';
import { useIsSubscribed } from '../hooks/useOnboardingUpsellExperiment';

export default function Download() {
  const theme = useDesignSystemTheme();
  const isSubscribed = useIsSubscribed(false);

  return (
    <AppLayout
      toolbar={
        <Toolbar>
          <NavigationLinks includeDownload />
        </Toolbar>
      }
    >
      <Stack.V flex="1" gap={44}>
        <Stack.V gap={20}>
          <Stack.H alignItems="center">
            <Heading2 color="text">Download for Mac</Heading2>
          </Stack.H>
          {isSubscribed ? (
            <Stack.H
              border={`1px solid ${theme.colors.dividerSubtle}`}
              padding={20}
              background={theme.colors.sidebar.background}
              alignItems="center"
              flex="1"
            >
              <img
                src={logo}
                alt="Noya Logo"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 8,
                }}
              />
              <Spacer.Horizontal size={16} />
              <Stack.V gap={2} flex="1">
                <Heading4 color="text" flex="1">
                  Noya for Mac
                </Heading4>
                <Small color="textMuted">
                  The Noya tools, packaged as a standalone Mac app. Available to
                  Noya Professional subscribers.
                </Small>
                <Small color="textSubtle">v1.0.14</Small>
              </Stack.V>
              <Spacer.Horizontal size={16} />
              <Button
                variant="primary"
                onClick={() => {
                  openInNewTab(
                    'https://github.com/noya-app/noya/releases/download/v0.0.14/Noya-darwin-universal-0.0.14.zip',
                  );
                }}
              >
                Download
                <Spacer.Horizontal size={6} inline />
                <DownloadIcon />
              </Button>
            </Stack.H>
          ) : (
            <Stack.H>
              <Small color="textMuted">
                Noya for Mac is available to Noya Professional subscribers.
              </Small>
            </Stack.H>
          )}
        </Stack.V>
      </Stack.V>
    </AppLayout>
  );
}

function openInNewTab(url: string) {
  window?.open(url, '_blank')?.focus();
}
