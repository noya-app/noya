import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useSelector } from 'noya-app-state-context';
import {
  darkTheme,
  Divider,
  InputField,
  lightTheme,
  ScrollArea,
  Spacer,
} from 'noya-designsystem';
import { Size } from 'noya-geometry';
import { Selectors, WorkspaceTab } from 'noya-state';
import { memo, useMemo, useRef } from 'react';
import { ReactNode, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useSize } from '../hooks/useSize';
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
  borderRight: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: BACKDROP_FILTER,
  backdropFilter: BACKDROP_FILTER,
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
}));

const AutoSizer = memo(function AutoSizer({
  children,
}: {
  children: (size: Size) => ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerSize = useSize(containerRef);

  return (
    <div
      ref={containerRef}
      style={useMemo(
        () => ({
          display: 'flex',
          flex: '1 0 0',
          flexDirection: 'column',
        }),
        [],
      )}
    >
      {containerSize &&
        containerSize.width > 0 &&
        containerSize.height > 0 &&
        children(containerSize)}
    </div>
  );
});

function useTabElement(elementMap: Record<WorkspaceTab, ReactNode>) {
  const currentTab = useSelector(Selectors.getCurrentTab);

  return elementMap[currentTab];
}

export default function Workspace() {
  const colorScheme = useSystemColorScheme();
  const [layersFilter, setLayersFilter] = useState('');

  return (
    <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <LeftSidebar>
        <Menubar />
        <PageList />
        <Divider />
        {useTabElement({
          canvas: <AutoSizer>{(size) => <LayerList size={size} />}</AutoSizer>,
          pages: <Spacer.Vertical />,
          theme: <ThemeGroups />,
        })}
        <FilterContainer>
          <InputField.Root labelPosition="start" labelSize={14}>
            <InputField.Input
              value={layersFilter}
              onChange={setLayersFilter}
              placeholder="Filter layers"
            />
            <InputField.Label>
              <MagnifyingGlassIcon />
            </InputField.Label>
          </InputField.Root>
        </FilterContainer>
        <Spacer.Vertical size={8} />
      </LeftSidebar>
      <MainView>
        <ToolbarContainer>
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
