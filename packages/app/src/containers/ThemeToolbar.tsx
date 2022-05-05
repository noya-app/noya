import React, { useMemo, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';

import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Button, RadioGroup, Layout } from 'noya-designsystem';
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
    (value: string) => dispatch('setThemeTab', value as ThemeTab),
    [dispatch],
  );

  const addSwatch = useCallback(() => dispatch('addSwatch'), [dispatch]);
  const addThemeStyle = useCallback(
    () => dispatch('addThemeStyle'),
    [dispatch],
  );
  const addTextStyle = useCallback(() => dispatch('addTextStyle'), [dispatch]);

  const removeSwatch = useCallback(() => dispatch('removeSwatch'), [dispatch]);
  const removeTextStyle = useCallback(
    () => dispatch('removeTextStyle'),
    [dispatch],
  );
  const removeThemeStyle = useCallback(
    () => dispatch('removeThemeStyle'),
    [dispatch],
  );

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
        <Layout.Queue size={8} />
        <Layout.Queue />
        <TabsContainer>
          <RadioGroup.Root
            id={'components'}
            value={componentsTab}
            onValueChange={handleChangeTab}
          >
            <RadioGroup.Item value="swatches" tooltip="Theme colors">
              <Layout.Icon name="blending-mode" />
            </RadioGroup.Item>
            <RadioGroup.Item value="textStyles" tooltip="Theme text styles">
              <Layout.Icon name="letter-case-toggle" />
            </RadioGroup.Item>
            <RadioGroup.Item value="layerStyles" tooltip="Theme layer styles">
              <Layout.Icon name="margin" />
            </RadioGroup.Item>
            <RadioGroup.Item value="symbols" tooltip="Theme symbols">
              <Layout.Icon name="component-instance" />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </TabsContainer>
        <RightContainer>
          <Layout.Queue size={24} />
          {componentsTab !== 'symbols' && (
            <Button id="add-component" onClick={addComponent}>
              <Layout.Icon name="plus" />
            </Button>
          )}
          <Layout.Queue size={4} />
          <Button id="remove-component" onClick={removeComponent}>
            <Layout.Icon name="trash" />
          </Button>
        </RightContainer>
        <Layout.Queue size={sidebarWidth + 8} />
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
