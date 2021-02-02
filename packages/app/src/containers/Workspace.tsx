import styled, { ThemeProvider } from 'styled-components';
import Divider from '../components/Divider';
import * as Spacer from '../components/Spacer';
import { defaultTheme } from '../theme';
import Canvas from './Canvas';
import Inspector from './Inspector';
import LayerList from './LayerList';
import PageList from './PageList';
import Toolbar from './Toolbar';

const LeftSidebar = styled.div(({ theme }) => ({
  flex: '0 0 260px',
  borderRight: `1px solid ${theme.colors.divider}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FAFAFA',
}));

const RightSidebar = styled.div(({ theme }) => ({
  flex: '0 0 260px',
  borderLeft: `1px solid ${theme.colors.divider}`,
  display: 'flex',
  flexDirection: 'column',
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
  return (
    <ThemeProvider theme={defaultTheme}>
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
