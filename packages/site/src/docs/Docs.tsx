import produce from 'immer';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { darkTheme, Divider, Stack } from 'noya-designsystem';
import * as Icons from 'noya-icons';
import { amplitude } from 'noya-log';
import React, {
  ComponentProps,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Anchor,
  defaultTheme,
  findNodeBySlug,
  guidebookStyled,
  GuidebookThemeProvider,
  InlineCode,
  isExternalUrl,
  LinkProps,
  LinkProvider,
  Page,
  PageComponents,
  RouterProvider,
} from 'react-guidebook';
import styled from 'styled-components';
import guidebook from '../../guidebook';
import { symbolMap } from '../ayon/symbols/symbols';
import { Ayon } from '../components/Ayon';
import { AyonProvider } from '../components/AyonContext';
import { NavigationLinks } from '../components/NavigationLinks';
import { Toolbar } from '../components/Toolbar';
import { BlockGrid } from './BlockGrid';
import { getHeadTags } from './getHeadTags';
import { InteractiveBlockPreview } from './InteractiveBlockPreview';
import { searchPages, searchTextMatch } from './search';
import { socialConfig } from './socialConfig';

const { MDXProvider } = require('@mdx-js/react');

const theme = darkTheme;

export const docsTheme = produce(defaultTheme, (draft) => {
  draft.sizes.inset.top = 46;

  draft.colors.background = theme.colors.canvas.background;
  draft.colors.text = theme.colors.text;
  draft.colors.textMuted = theme.colors.textMuted;
  draft.colors.divider = theme.colors.divider;
  draft.colors.neutralBackground = theme.colors.neutralBackground;
  draft.colors.textDecorativeLight = '#bba1ff';
  draft.colors.selectedBackground = 'rgba(140, 125, 253, 0.25)';
  draft.colors.textLink = '#00a4ff';
  // draft.colors.textLinkFocused = theme.colors.primaryLight;
  draft.colors.inlineCode.text = theme.colors.secondaryBright;
  draft.colors.inlineCode.background = '#00968842';

  draft.colors.primary = theme.colors.primary;
  draft.colors.title.left = 'white';
  draft.colors.title.right = 'white';

  draft.colors.button.primaryBackground = theme.colors.primary;
  draft.colors.button.secondaryBackground = '#444';
  draft.colors.codeBackgroundLight = 'rgba(140, 125, 253, 0.25)';
  draft.colors.neutralBackground = 'rgba(140, 125, 253, 0.25)';

  draft.colors.starButton.icon = 'white';
  draft.colors.starButton.background = 'linear-gradient(to bottom, #444, #333)';
  draft.colors.starButton.divider = '#444';
  draft.colors.starButton.iconBackground.top = '#444';
  draft.colors.starButton.iconBackground.bottom = '#333';

  draft.colors.search.inputBackground = '#333';
  draft.colors.search.menuBackground = '#333';
  draft.colors.search.menuItemBackground = '#444';
  draft.colors.search.textHighlight = draft.colors.textDecorativeLight;

  draft.textStyles.body.color = draft.colors.text;
  draft.textStyles.heading1.color = draft.colors.text;
  draft.textStyles.heading2.color = draft.colors.text;
  draft.textStyles.heading3.color = draft.colors.text;
  draft.textStyles.title.color = draft.colors.text;
  draft.textStyles.subtitle.color = draft.colors.text;
  draft.textStyles.small.color = draft.colors.text;
  draft.textStyles.code.color = draft.colors.text;

  draft.textStyles.sidebar.title.color = draft.colors.text;
  draft.textStyles.sidebar.title.fontWeight = 500;
  draft.textStyles.sidebar.row.color = draft.colors.text;
  draft.textStyles.sidebar.row.fontWeight = 500;
  draft.textStyles.sidebar.rowSmall.color = draft.colors.text;
  draft.textStyles.sidebar.rowSmall.fontWeight = 500;
});

const StyledAnchor = styled(PageComponents.a)({
  // Prevent long lines from overflowing and resizing the page on mobile
  // lineBreak: 'anywhere',
});

const ScrollableTableContainer = guidebookStyled.div({
  overflowX: 'auto',
  margin: '20px 0',
});

const StyledTable = guidebookStyled(PageComponents.table)({
  background: '#1c1c1c',
  marginBottom: 0,
});

const getSymbolMaster = (symbolId: string) => symbolMap[symbolId];

const MDXComponents = {
  ...PageComponents,
  a: StyledAnchor,
  kbd: InlineCode,
  InteractiveBlockPreview: (
    props: ComponentProps<typeof InteractiveBlockPreview>,
  ) => <InteractiveBlockPreview {...props} getSymbolMaster={getSymbolMaster} />,
  BlockGrid: (
    props: ComponentProps<typeof BlockGrid> & { category: string },
  ) => <BlockGrid {...props} getSymbolMaster={getSymbolMaster} />,
  InlineIcon: ({ name }: { name: keyof typeof Icons }) => {
    const Component = Icons[name];

    return (
      <Component style={{ display: 'inline', verticalAlign: 'text-top' }} />
    );
  },
  table: (props: React.ComponentProps<typeof PageComponents['table']>) => (
    <ScrollableTableContainer>
      <StyledTable {...props} />
    </ScrollableTableContainer>
  ),
};

function cleanPath(prefix: string, path: string) {
  const cleaned = path.replace(prefix, '');
  return cleaned === '' ? '/' : cleaned;
}

export function Docs({
  children,
  urlPrefix,
}: {
  children: ReactNode;
  urlPrefix: string;
}) {
  const router = useRouter();
  const scrollElement = useRef<HTMLDivElement>(null);
  const basePath = router.basePath;

  const loggedOpen = useRef(false);
  const loggedOpenPath = useRef<string | undefined>();

  // `asPath` has /docs prefix (but no basePath)
  const openedPath = cleanPath(urlPrefix, router.asPath);

  useEffect(() => {
    if (loggedOpen.current) return;

    loggedOpen.current = true;
    loggedOpenPath.current = openedPath;

    amplitude.logEvent(`Docs - Opened - ${openedPath}`);
  }, [openedPath, loggedOpen]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      scrollElement.current?.scrollTo(0, 0);

      // `url` has /app/docs prefix
      const changedPath = cleanPath(`${basePath}${urlPrefix}`, url);

      // Don't log Changed if we just logged Opened
      if (changedPath === loggedOpenPath.current) {
        loggedOpenPath.current = undefined;
      } else {
        amplitude.logEvent(`Docs - Changed - ${changedPath}`);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [basePath, router.events, urlPrefix]);

  // Use `asPath`, since `pathname` will be "_error" if the page isn't found
  const pathname = router.pathname.slice(urlPrefix.length);
  const clientPath = router.asPath.slice(urlPrefix.length);

  const routerWithPrefix = useMemo(
    () => ({
      pathname,
      clientPath,
      push: (pathname: string) => {
        router.push(`${urlPrefix}${pathname}`);
      },
    }),
    [pathname, clientPath, router, urlPrefix],
  );

  const LinkComponent = useMemo(() => {
    return ({ href, children, style }: LinkProps) => {
      return (
        <Link
          href={
            isExternalUrl(href)
              ? href
              : href.startsWith('#')
              ? href
              : `${urlPrefix}${href}`
          }
          passHref
        >
          <Anchor style={style}>{children}</Anchor>
        </Link>
      );
    };
  }, [urlPrefix]);

  const node = findNodeBySlug(guidebook, pathname.slice(1));

  return (
    <Stack.V flex="1" background={darkTheme.colors.canvas.background}>
      <Head>
        <title>Noya Docs</title>
        {getHeadTags({
          pageTitle: node?.title ?? 'Noya Docs',
          pageDescription: node?.subtitle ?? 'Noya Docs',
          config: socialConfig,
        })}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RouterProvider value={routerWithPrefix}>
        <LinkProvider value={LinkComponent}>
          {/* <Styles.Main /> */}
          <Toolbar>
            <NavigationLinks />
          </Toolbar>
          <Divider variant="strong" />
          <GuidebookThemeProvider theme={docsTheme}>
            {/* A single child is required here for React.Children.only */}
            <MDXProvider components={MDXComponents}>
              <Stack.V overflowY="auto" ref={scrollElement}>
                <AyonProvider value={Ayon}>
                  <Page
                    rootNode={guidebook}
                    searchPages={searchPages}
                    searchTextMatch={searchTextMatch}
                  >
                    {children}
                  </Page>
                </AyonProvider>
              </Stack.V>
            </MDXProvider>
          </GuidebookThemeProvider>
        </LinkProvider>
      </RouterProvider>
    </Stack.V>
  );
}
