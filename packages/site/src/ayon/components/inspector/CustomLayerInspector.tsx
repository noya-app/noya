import { Stack, useDesignSystemTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import React, { memo } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { CustomLayerData } from '../../types';
import { ComponentDescriptionInspector } from './ComponentDescriptionInspector';
import { ComponentLayoutInspector } from './ComponentLayoutInspector';
import { ComponentNameInspector } from './ComponentNameInspector';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
};

export const CustomLayerInspector = memo(function CustomLayerInspector({
  selectedLayer,
  highlightedPath,
  setHighlightedPath,
}: Props) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V
      gap="1px"
      position="relative"
      background={theme.colors.canvas.background}
    >
      <InspectorSection title="Component" titleTextStyle="heading3">
        <ComponentNameInspector selectedLayer={selectedLayer} />
        <ComponentDescriptionInspector selectedLayer={selectedLayer} />
      </InspectorSection>
      <ComponentLayoutInspector
        selectedLayer={selectedLayer}
        highlightedPath={highlightedPath}
        setHighlightedPath={setHighlightedPath}
      />
    </Stack.V>
  );
});
