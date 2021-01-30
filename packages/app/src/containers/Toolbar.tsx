import styled from 'styled-components';
import { useApplicationState } from '../contexts/ApplicationStateContext';

interface Props {}

const Container = styled.header(({ theme }) => ({
  height: '60px',
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.divider}`,
}));

export default function Toolbar(props: Props) {
  const [state, dispatch] = useApplicationState();

  return <Container></Container>;
}
