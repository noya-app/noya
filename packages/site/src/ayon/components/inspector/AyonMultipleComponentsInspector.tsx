import { Button, Spacer, Stack, useDesignSystemTheme } from 'noya-designsystem';
import { ViewHorizontalIcon, ViewVerticalIcon } from 'noya-icons';
import React, { memo, useCallback } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { useAyonDispatch } from '../../state/ayonState';

export const AyonMultipleComponentsInspector = memo(
  function AyonMultipleComponentsInspector({
    layerIds,
  }: {
    layerIds: string[];
  }) {
    const theme = useDesignSystemTheme();
    const dispatch = useAyonDispatch();

    const handleMergeIntoVerticalStack = useCallback(() => {
      dispatch('mergeIntoStack', layerIds, 'vertical');
    }, [dispatch, layerIds]);

    const handleMergeIntoHorizontalStack = useCallback(() => {
      dispatch('mergeIntoStack', layerIds, 'horizontal');
    }, [dispatch, layerIds]);

    return (
      <Stack.V
        gap="1px"
        position="relative"
        background={theme.colors.canvas.background}
      >
        <InspectorSection title="Actions" titleTextStyle="heading4">
          <Button onClick={handleMergeIntoVerticalStack}>
            Group as Vertical Stack
            <Spacer.Horizontal inline size="6px" />
            <ViewHorizontalIcon />
          </Button>
          <Button onClick={handleMergeIntoHorizontalStack}>
            Group as Horizontal Stack
            <Spacer.Horizontal inline size="6px" />
            <ViewVerticalIcon />
          </Button>
        </InspectorSection>
      </Stack.V>
    );
  },
);
