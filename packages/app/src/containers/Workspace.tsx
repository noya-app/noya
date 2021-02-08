import styled, { ThemeProvider } from 'styled-components';
import Divider from '../components/Divider';
import * as Spacer from '../components/Spacer';
import useSystemColorScheme from '../hooks/useSystemColorScheme';
import * as lightTheme from '../theme/light';
import * as darkTheme from '../theme/dark';
import Canvas from './Canvas';
import Inspector from './Inspector';
import LayerList from './LayerList';
import PageList from './PageList';
import Toolbar from './Toolbar';

const LeftSidebar = styled.div(({ theme }) => ({
  flex: `0 0 ${theme.sizes.sidebarWidth}px`,
  borderRight: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: 'blur(10px)',
  backdropFilter: 'blur(10px)',
}));

const RightSidebar = styled.div(({ theme }) => ({
  flex: '0 0 260px',
  borderLeft: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
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

interface Props {}

export default function Workspace(props: Props) {
  const colorScheme = useSystemColorScheme();

  return (
    <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <LeftSidebar>
        <Spacer.Vertical size={59} />
        <Divider />
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
