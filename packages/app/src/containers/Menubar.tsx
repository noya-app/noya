import {
  HamburgerMenuIcon,
  StackIcon,
  TokensIcon,
} from '@radix-ui/react-icons';
import { Selectors, WorkspaceTab } from 'noya-state';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Button from '../components/Button';
import * as Label from '../components/Label';
import LabeledElementView from '../components/LabeledElementView';
import * as RadioGroup from '../components/RadioGroup';
import * as Spacer from '../components/Spacer';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';

const Container = styled.header<{ showLabels: boolean }>(
  ({ theme, showLabels }) => ({
    height: `${
      showLabels
        ? theme.sizes.toolbarHeight.large
        : theme.sizes.toolbarHeight.small
    }px`,
    display: 'flex',
    borderBottom: `1px solid transparent`, // For height to match toolbar
    alignItems: 'center',
    backgroundColor: theme.colors.sidebar.background,
    color: theme.colors.textMuted,
  }),
);

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
}));

export default function Menubar() {
  const [, dispatch] = useApplicationState();
  const currentTab = useSelector(Selectors.getCurrentTab);
  const showLabels = useSelector(Selectors.getShowToolbarLabels);

  const canvasRadioGroupId = `view`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case canvasRadioGroupId:
          return (
            <Label.Label>
              {currentTab === 'canvas' ? 'Canvas' : 'Components'}
            </Label.Label>
          );
        default:
          return null;
      }
    },
    [canvasRadioGroupId, currentTab],
  );

  const handleChangeView = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch('setTab', event.target.value as WorkspaceTab);
    },
    [dispatch],
  );

  return useMemo(() => {
    const radioGroup = (
      <RadioGroup.Root
        id={canvasRadioGroupId}
        value={currentTab}
        onValueChange={handleChangeView}
      >
        <RadioGroup.Item value="canvas">
          <StackIcon />
        </RadioGroup.Item>
        <RadioGroup.Item value="components">
          <TokensIcon />
        </RadioGroup.Item>
      </RadioGroup.Root>
    );
    return (
      <Container showLabels={showLabels}>
        <Spacer.Horizontal size={8} />
        <Row>
          <Button id="menu">
            <HamburgerMenuIcon />
          </Button>
          <Spacer.Horizontal />
          {showLabels ? (
            <LabeledElementView renderLabel={renderLabel}>
              {radioGroup}
            </LabeledElementView>
          ) : (
            radioGroup
          )}
        </Row>
        <Spacer.Horizontal size={8} />
      </Container>
    );
  }, [
    canvasRadioGroupId,
    currentTab,
    handleChangeView,
    showLabels,
    renderLabel,
  ]);
}
