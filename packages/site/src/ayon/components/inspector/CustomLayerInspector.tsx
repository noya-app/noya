import { useApplicationState } from 'noya-app-state-context';
import { Stack, useDesignSystemTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import React, { useCallback } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { ComponentNameInspector } from './ComponentNameInspector';

export function CustomLayerInspector({
  selectedLayer,
}: {
  selectedLayer: Sketch.CustomLayer;
}) {
  const [, dispatch] = useApplicationState();
  const theme = useDesignSystemTheme();

  const handleChangeName = useCallback(
    (value: string) => {
      dispatch('setLayerName', selectedLayer.do_objectID, value);
    },
    [dispatch, selectedLayer.do_objectID],
  );

  return (
    <Stack.V
      gap="1px"
      position="relative"
      background={theme.colors.canvas.background}
    >
      <InspectorSection title={'Component'} titleTextStyle="heading3">
        <InspectorPrimitives.LabeledRow label="Name">
          <ComponentNameInspector
            name={selectedLayer.name}
            frame={selectedLayer.frame}
            onChangeName={handleChangeName}
          />
        </InspectorPrimitives.LabeledRow>
      </InspectorSection>
    </Stack.V>
  );
}
