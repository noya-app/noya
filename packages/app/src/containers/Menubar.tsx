import { RadioGroup, Spacer } from 'noya-designsystem';
import {
  HamburgerMenuIcon,
  StackIcon,
  TokensIcon,
} from '@radix-ui/react-icons';
import { Selectors, WorkspaceTab } from 'noya-state';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Button from 'noya-designsystem/src/components/Button';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';

const Container = styled.header(({ theme }) => ({
  height: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid transparent`, // For height to match toolbar
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
}));

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
}));

export default function Menubar() {
  const [, dispatch] = useApplicationState();
  const currentTab = useSelector(Selectors.getCurrentTab);

  const handleChangeTab = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch('setTab', event.target.value as WorkspaceTab);
    },
    [dispatch],
  );

  return useMemo(
    () => (
      <Container>
        <Spacer.Horizontal size={8} />
        <Row>
          <Button id="menu" tooltip="Menu">
            <HamburgerMenuIcon />
          </Button>
          <Spacer.Horizontal />
          <RadioGroup.Root value={currentTab} onValueChange={handleChangeTab}>
            <RadioGroup.Item value="canvas" tooltip="Canvas">
              <StackIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="theme" tooltip="Theme">
              <TokensIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </Row>
        <Spacer.Horizontal size={8} />
      </Container>
    ),
    [currentTab, handleChangeTab],
  );
}
