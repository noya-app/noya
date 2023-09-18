import {
  ActivityIndicator,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import React, { memo, useCallback, useMemo } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSLayoutTree } from '../../../dseditor/DSLayoutTree';
import { createResolvedNode, unresolve } from '../../../dseditor/traversal';
import { NoyaComponent, NoyaResolvedNode } from '../../../dseditor/types';
import { useCurrentGeneratedLayout } from '../../hooks/useCurrentGeneratedLayout';
import { useAyonDispatch } from '../../state/ayonState';
import { CustomLayerData } from '../../types';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
};

export const AyonElementsInspector = memo(function AyonElementsInspector({
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
      <ElementInspector
        selectedLayer={selectedLayer}
        highlightedPath={highlightedPath}
        setHighlightedPath={setHighlightedPath}
      />
    </Stack.V>
  );
});

const ElementInspector = memo(function ElementInspector({
  selectedLayer,
  highlightedPath,
  setHighlightedPath,
}: Props) {
  const dispatch = useAyonDispatch();

  const { generatedLayout, activeIndex, node } =
    useCurrentGeneratedLayout(selectedLayer);

  const findComponent = useCallback((id: string): NoyaComponent | undefined => {
    return undefined;
  }, []);

  const resolvedNode = useMemo(() => {
    if (!node) return;

    return createResolvedNode(findComponent, node);
  }, [findComponent, node]);

  const handleChange = useCallback(
    (newResolvedNode: NoyaResolvedNode) => {
      if (!node) return;

      const newNode = unresolve(newResolvedNode);

      dispatch('setLayerNode', selectedLayer.do_objectID, newNode, 'keep');
    },
    [dispatch, node, selectedLayer.do_objectID],
  );

  return (
    <InspectorSection
      title="UI Elements"
      titleTextStyle="heading3"
      right={
        !selectedLayer.data.node &&
        generatedLayout[activeIndex]?.loading && <ActivityIndicator size={13} />
      }
    >
      {resolvedNode && resolvedNode.type !== 'noyaString' && (
        <DSLayoutTree
          resolvedNode={resolvedNode}
          onChange={handleChange}
          findComponent={findComponent}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
        />
      )}
    </InspectorSection>
  );
});
