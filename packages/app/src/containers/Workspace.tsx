import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  darkTheme,
  Divider,
  InputField,
  lightTheme,
  Spacer,
} from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useSelector } from '../contexts/ApplicationStateContext';
import useSystemColorScheme from '../hooks/useSystemColorScheme';
import Canvas from './Canvas';
import Inspector from './Inspector';
import LayerList from './LayerList';
import Menubar from './Menubar';
import PageList from './PageList';
import ThemeGroups from './ThemeGroups';
import ThemeInspector from './ThemeInspector';
import ThemeToolbar from './ThemeToolbar';
import ThemeWindow from './ThemeWindow';
import Toolbar from './Toolbar';

const LeftSidebar = styled.div(({ theme }) => ({
  flex: `0 0 ${theme.sizes.sidebarWidth}px`,
  maxWidth: `${theme.sizes.sidebarWidth}px`,
  borderRight: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: 'blur(10px)',
  backdropFilter: 'blur(10px)',
}));

const RightSidebar = styled.div(({ theme }) => ({
  flex: `0 0 ${theme.sizes.sidebarWidth}px`,
  maxWidth: `${theme.sizes.sidebarWidth}px`,
  borderLeft: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: 'blur(10px)',
  backdropFilter: 'blur(10px)',
  overflowY: 'auto',
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

const ScrollArea = styled.div(({ theme }) => ({
  flex: '1 1 0px',
  display: 'flex',
  overflowY: 'auto',
  flexDirection: 'column',
}));

const FilterContainer = styled.div(({ theme }) => ({
  minHeight: '32px',
  marginLeft: '8px',
  marginRight: '8px',
  display: 'flex',
}));

const CanvasTab = memo(function CanvasTab() {
  const [layersFilter, setLayersFilter] = useState('');

  return (
    <>
      <LeftSidebar>
        <Menubar />
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
        <Spacer.Vertical size={4} />
        <PageList />
        <Divider />
        <LayerList />
      </LeftSidebar>
      <MainView>
        <Toolbar />
        <ContentArea>
          <Canvas />
          <RightSidebar>
            <ScrollArea>
              <Inspector />
            </ScrollArea>
          </RightSidebar>
        </ContentArea>
      </MainView>
    </>
  );
});

const ThemeTab = memo(function ThemeTab() {
  return (
    <>
      <LeftSidebar>
        <Menubar />
        <Spacer.Vertical size={4} />
        <ThemeGroups />
      </LeftSidebar>
      <MainView>
        <ThemeToolbar />
        <ContentArea>
          <ThemeWindow />
          <RightSidebar>
            <ScrollArea>
              <ThemeInspector />
            </ScrollArea>
          </RightSidebar>
        </ContentArea>
      </MainView>
    </>
  );
});

export default function Workspace() {
  const colorScheme = useSystemColorScheme();
  const currentTab = useSelector(Selectors.getCurrentTab);

  return (
    <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      {currentTab === 'canvas' ? <CanvasTab /> : <ThemeTab />}
    </ThemeProvider>
  );
}
