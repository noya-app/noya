import { Stack, useDesignSystemTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import React, { memo } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { NoyaNode } from '../../../dseditor/types';
import { CustomLayerData } from '../../types';
import { ComponentDescriptionInspector } from './ComponentDescriptionInspector';
import { ComponentLayoutInspector } from './ComponentLayoutInspector';
import { ComponentNameInspector } from './ComponentNameInspector';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

export const CustomLayerInspector = memo(function CustomLayerInspector({
  selectedLayer,
  setPreviewNode,
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
        setPreviewNode={setPreviewNode}
      />
    </Stack.V>
  );
});
