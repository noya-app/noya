import { RadioGroup, Spacer } from 'noya-designsystem';
import {
  BlendingModeIcon,
  ComponentInstanceIcon,
  LetterCaseToggleIcon,
  MarginIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import React, { useMemo, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import Button from 'noya-designsystem/src/components/Button';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { Selectors, ComponentsTab } from 'noya-state';

const Container = styled.header(({ theme }) => ({
  height: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.dividerStrong}`,
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
}));

const TabsContainer = styled.div(({ theme }) => ({
  minWidth: `${54 * 4}px`,
  maxWidth: `${54 * 4}px`,
  height: '27px',
  display: 'flex',
  flex: '1',
}));

const RightContainer = styled.div(({ theme }) => ({
  flex: '1 1 0',
  display: 'flex',
  flexDirection: 'row',
}));

export default function SwatchesToolbar() {
  const [, dispatch] = useApplicationState();
  const {
    sizes: { sidebarWidth },
  } = useTheme();
  const componentsTab = useSelector(Selectors.getCurrentComponentsTab);

  const handleChangeTab = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch('setComponentsTab', event.target.value as ComponentsTab);
    },
    [dispatch],
  );

  return useMemo(
    () => (
      <Container>
        <Spacer.Horizontal size={8} />
        <Spacer.Horizontal />
        <TabsContainer>
          <RadioGroup.Root
            id={'test'}
            value={componentsTab}
            onValueChange={handleChangeTab}
          >
            <RadioGroup.Item value="swatches" tooltip="Shared colors">
              <BlendingModeIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="textStyles" tooltip="Shared text styles">
              <LetterCaseToggleIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="layerStyles" tooltip="Shared layer styles">
              <MarginIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="symbols" tooltip="Shared symbols">
              <ComponentInstanceIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </TabsContainer>
        <RightContainer>
          <Spacer.Horizontal size={24} />
          <Button
            id="add-style"
            onClick={() => {
              switch (componentsTab) {
                case 'swatches':
                  dispatch('addColorSwatch');
                  break;
                case 'layerStyles':
                  dispatch('addLayerStyle');
                  break;
              }
            }}
          >
            <PlusIcon />
          </Button>
        </RightContainer>
        <Spacer.Horizontal size={sidebarWidth + 8} />
      </Container>
    ),
    [dispatch, sidebarWidth, componentsTab, handleChangeTab],
  );
}
