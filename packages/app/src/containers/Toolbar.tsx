import styled from 'styled-components';
import Button from '../components/Button';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import { SquareIcon, CircleIcon } from '@radix-ui/react-icons';
import * as Spacer from '../components/Spacer';

interface Props {}

const Container = styled.header(({ theme }) => ({
  height: '60px',
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.divider}`,
  alignItems: 'center',
}));

export default function Toolbar(props: Props) {
  const [state, dispatch] = useApplicationState();

  return (
    <Container>
      <Spacer.Horizontal size={8} />
      <Button label="Rectangle">
        <SquareIcon />
      </Button>
      <Spacer.Horizontal size={16} />
      <Button label="Circle">
        <CircleIcon />
      </Button>
      <Spacer.Horizontal size={8} />
    </Container>
  );
}
