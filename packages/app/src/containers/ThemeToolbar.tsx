import { Button, RadioGroup, Spacer } from 'noya-designsystem';
import {
  BlendingModeIcon,
  ComponentInstanceIcon,
  LetterCaseToggleIcon,
  MarginIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import React, { useMemo, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Selectors, ThemeTab } from 'noya-state';

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
      dispatch('setThemeTab', event.target.value as ThemeTab);
    },
    [dispatch],
  );

  const addSwatch = useCallback(() => dispatch('addSwatch'), [dispatch]);
  const addThemeStyle = useCallback(() => dispatch('addThemeStyle'), [
    dispatch,
  ]);
  const addTextStyle = useCallback(() => dispatch('addTextStyle'), [dispatch]);

  const removeSwatch = useCallback(() => dispatch('removeSwatch'), [dispatch]);
  const removeTextStyle = useCallback(() => dispatch('removeTextStyle'), [
    dispatch,
  ]);
  const removeThemeStyle = useCallback(() => dispatch('removeThemeStyle'), [
    dispatch,
  ]);

  const addComponent = useCallback(() => {
    switch (componentsTab) {
      case 'swatches':
        addSwatch();
        break;
      case 'textStyles':
        addTextStyle();
        break;
      case 'layerStyles':
        addThemeStyle();
        break;
    }
  }, [componentsTab, addSwatch, addThemeStyle, addTextStyle]);

  const removeComponent = useCallback(() => {
    switch (componentsTab) {
      case 'swatches':
        removeSwatch();
        break;
      case 'textStyles':
        removeTextStyle();
        break;
      case 'layerStyles':
        removeThemeStyle();
        break;
    }
  }, [componentsTab, removeSwatch, removeThemeStyle, removeTextStyle]);

  return useMemo(
    () => (
      <>
        <Spacer.Horizontal size={8} />
        <Spacer.Horizontal />
        <TabsContainer>
          <RadioGroup.Root
            id={'components'}
            value={componentsTab}
            onValueChange={handleChangeTab}
          >
            <RadioGroup.Item value="swatches" tooltip="Theme colors">
              <BlendingModeIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="textStyles" tooltip="Theme text styles">
              <LetterCaseToggleIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="layerStyles" tooltip="Theme layer styles">
              <MarginIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="symbols" tooltip="Theme symbols">
              <ComponentInstanceIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </TabsContainer>
        <RightContainer>
          <Spacer.Horizontal size={24} />
          {componentsTab !== 'symbols' && (
            <Button id="add-component" onClick={addComponent}>
              <PlusIcon />
            </Button>
          )}
          <Spacer.Horizontal size={4} />
          <Button id="remove-component" onClick={removeComponent}>
            <TrashIcon />
          </Button>
        </RightContainer>
        <Spacer.Horizontal size={sidebarWidth + 8} />
      </>
    ),
    [
      sidebarWidth,
      componentsTab,
      handleChangeTab,
      addComponent,
      removeComponent,
    ],
  );
}
