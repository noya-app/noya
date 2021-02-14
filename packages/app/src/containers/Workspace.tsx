import styled, { ThemeProvider } from 'styled-components';
import Divider from '../components/Divider';
import * as Spacer from '../components/Spacer';
import * as InputField from '../components/InputField';
import useSystemColorScheme from '../hooks/useSystemColorScheme';
import * as lightTheme from '../theme/light';
import * as darkTheme from '../theme/dark';
import Canvas from './Canvas';
import Inspector from './Inspector';
import LayerList from './LayerList';
import PageList from './PageList';
import Toolbar from './Toolbar';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

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

interface Props {}

export default function Workspace(props: Props) {
  const colorScheme = useSystemColorScheme();
  const [layersFilter, setLayersFilter] = useState('');

  return (
    <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <LeftSidebar>
        <Spacer.Vertical size={59} />
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
            <Inspector />
          </RightSidebar>
        </ContentArea>
      </MainView>
    </ThemeProvider>
  );
}
