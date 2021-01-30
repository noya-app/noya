import styled, { ThemeProvider } from 'styled-components';
import Divider from '../components/Divider';
import { defaultTheme } from '../theme';
import Canvas from './Canvas';
import LayerList from './LayerList';
import PageList from './PageList';

const LeftSidebar = styled.div(({ theme }) => ({
  flex: '0 0 260px',
  borderRight: `1px solid ${theme.colors.divider}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
}));

interface Props {}

export default function Workspace(props: Props) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <LeftSidebar>
        <PageList />
        <Divider />
        <LayerList />
      </LeftSidebar>
      <Canvas />
    </ThemeProvider>
  );
}
