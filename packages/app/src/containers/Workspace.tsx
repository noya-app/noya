import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import produce from 'immer';
import { useSelector } from 'noya-app-state-context';
import {
  darkTheme,
  Divider,
  InputField,
  lightTheme,
  ScrollArea,
  Spacer,
} from 'noya-designsystem';
import { doubleClickToolbar } from 'noya-embedded';
import { Selectors, WorkspaceTab } from 'noya-state';
import { ReactNode, useMemo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { AutoSizer } from '../components/AutoSizer';
import { useEnvironmentParameter } from '../hooks/useEnvironmentParameters';
import useSystemColorScheme from '../hooks/useSystemColorScheme';
import Canvas from './Canvas';
import Inspector from './Inspector';
import LayerList from './LayerList';
import Menubar from './Menubar';
import PageList from './PageList';
import PagesGrid from './PagesGrid';
import ThemeGroups from './ThemeGroups';
import ThemeInspector from './ThemeInspector';
import ThemeToolbar from './ThemeToolbar';
import ThemeWindow from './ThemeWindow';
import Toolbar from './Toolbar';

const BACKDROP_FILTER = 'blur(10px)';

const LeftSidebar = styled.div(({ theme }) => ({
  flex: `0 0 ${theme.sizes.sidebarWidth}px`,
  maxWidth: `${theme.sizes.sidebarWidth}px`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: BACKDROP_FILTER,
  backdropFilter: BACKDROP_FILTER,
}));

const LeftSidebarBorderedContent = styled.div(({ theme }) => ({
  flex: '1 1 0',
  borderRight: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
}));

const RightSidebar = styled.div(({ theme }) => ({
  flex: `0 0 ${theme.sizes.sidebarWidth}px`,
  maxWidth: `${theme.sizes.sidebarWidth}px`,
  borderLeft: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: BACKDROP_FILTER,
  backdropFilter: BACKDROP_FILTER,
}));

const MainView = styled.main(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentArea = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
}));

const FilterContainer = styled.div(({ theme }) => ({
  minHeight: '32px',
  marginLeft: '8px',
  marginRight: '8px',
  display: 'flex',
}));

const ToolbarContainer = styled.header(({ theme }) => ({
  minHeight: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.dividerStrong}`,
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: BACKDROP_FILTER,
  backdropFilter: BACKDROP_FILTER,
  WebkitAppRegion: 'drag',
}));

const MenubarContainer = styled.header<{ showApplicationMenu: boolean }>(
  ({ theme, showApplicationMenu }) => ({
    minHeight: `${
      theme.sizes.toolbar.height - (showApplicationMenu ? 8 : 0)
    }px`,
    display: 'flex',
    flexDirection: 'column',
    borderBottom: `1px solid ${
      showApplicationMenu ? 'transparent' : theme.colors.dividerStrong
    }`,
    borderRight: `1px solid ${
      showApplicationMenu ? theme.colors.dividerStrong : 'transparent'
    }`,
    alignItems: 'stretch',
    justifyContent: 'center',
    color: theme.colors.textMuted,
    background: showApplicationMenu ? 'rgba(255,255,255,0.02)' : 'none',
    WebkitAppRegion: 'drag',
  }),
);

function useTabElement(elementMap: Record<WorkspaceTab, ReactNode>) {
  const currentTab = useSelector(Selectors.getCurrentTab);

  return elementMap[currentTab];
}

export default function Workspace() {
  const colorScheme = useSystemColorScheme();
  const [layersFilter, setLayersFilter] = useState('');
  const isElectron = useEnvironmentParameter('isElectron');
  const theme = useMemo(() => {
    const baseTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

    return produce(baseTheme, (draft) => {
      if (!isElectron) return;

      draft.sizes.toolbar.height = 53;
      draft.sizes.toolbar.itemSeparator = 12;
    });
  }, [colorScheme, isElectron]);

  return (
    <ThemeProvider theme={theme}>
      <LeftSidebar>
        <MenubarContainer
          showApplicationMenu={isElectron}
          onDoubleClick={doubleClickToolbar}
        >
          <Menubar />
        </MenubarContainer>
        <LeftSidebarBorderedContent>
          <PageList />
          <Divider />
          {useTabElement({
            canvas: (
              <>
                <AutoSizer>
                  {(size) => <LayerList size={size} filter={layersFilter} />}
                </AutoSizer>
                <FilterContainer>
                  <InputField.Root labelPosition="start" labelSize={14}>
                    <InputField.Input
                      value={layersFilter}
                      onChange={setLayersFilter}
                      placeholder="Filter layers"
                      type="search"
                    />
                    <InputField.Label>
                      <MagnifyingGlassIcon />
                    </InputField.Label>
                  </InputField.Root>
                </FilterContainer>
                <Spacer.Vertical size={8} />
              </>
            ),
            pages: <Spacer.Vertical />,
            theme: <ThemeGroups />,
          })}
        </LeftSidebarBorderedContent>
      </LeftSidebar>
      <MainView>
        <ToolbarContainer onDoubleClick={doubleClickToolbar}>
          {useTabElement({
            canvas: <Toolbar />,
            pages: null,
            theme: <ThemeToolbar />,
          })}
        </ToolbarContainer>
        <ContentArea>
          {useTabElement({
            canvas: <Canvas />,
            pages: <PagesGrid />,
            theme: <ThemeWindow />,
          })}
          <RightSidebar>
            <ScrollArea>
              {useTabElement({
                canvas: <Inspector />,
                pages: null,
                theme: <ThemeInspector />,
              })}
            </ScrollArea>
          </RightSidebar>
        </ContentArea>
      </MainView>
    </ThemeProvider>
  );
}
