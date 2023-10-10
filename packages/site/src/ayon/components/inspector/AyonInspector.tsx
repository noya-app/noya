import { useApplicationState } from 'noya-app-state-context';
import {
  RadioGroup,
  ScrollArea,
  Small,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { NoyaNode } from '../../../dseditor/types';
import { CustomLayerData, NodePath } from '../../types';
import { AyonElementsInspector } from './AyonElementsInspector';
import { AyonMultipleComponentsInspector } from './AyonMultipleComponentsInspector';
import { AyonPageInspector } from './AyonPageInspector';
import { AyonProjectInspector } from './AyonProjectInspector';
import { CustomLayerInspector } from './CustomLayerInspector';

type TabName = 'project' | 'component' | 'elements';

type Props = {
  name: string;
  onChangeName?: (name: string) => void;
  highlightedNodePath?: NodePath;
  setHighlightedNodePath: (value: NodePath | undefined) => void;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

export const AyonInspector = memo(function AyonInspector({
  name,
  onChangeName,
  highlightedNodePath,
  setHighlightedNodePath,
  setPreviewNode,
}: Props) {
  const theme = useDesignSystemTheme();
  const [state] = useApplicationState();

  const selectedLayers = useShallowArray(Selectors.getSelectedLayers(state));

  const selectedArtboards = useMemo(
    () => selectedLayers.filter(Layers.isArtboard),
    [selectedLayers],
  );
  const selectedCustomLayers = useMemo(
    () => selectedLayers.filter(Layers.isCustomLayer<CustomLayerData>),
    [selectedLayers],
  );
  const selectedCustomLayerIds = useMemo(
    () => selectedCustomLayers.map((layer) => layer.do_objectID),
    [selectedCustomLayers],
  );

  const highlightedPath =
    highlightedNodePath &&
    highlightedNodePath.layerId === selectedCustomLayers[0]?.do_objectID
      ? highlightedNodePath.path
      : undefined;

  const setHighlightedPath = useCallback(
    (path: string[] | undefined) => {
      setHighlightedNodePath(
        selectedCustomLayers[0] && path
          ? { layerId: selectedCustomLayers[0].do_objectID, path }
          : undefined,
      );
    },
    [selectedCustomLayers, setHighlightedNodePath],
  );

  const [selectedTabOverride, setSelectedTabOverride] = React.useState<
    TabName | undefined
  >(undefined);

  const automaticTab =
    selectedCustomLayers.length > 0 &&
    state.interactionState.type === 'editingBlock'
      ? 'elements'
      : selectedCustomLayers.length > 0
      ? 'component'
      : 'project';
  const selectedTab = selectedTabOverride ?? automaticTab;
  const selectedId = selectedCustomLayers[0]?.do_objectID;

  // Set the override when the automatic tab changes or the selection changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    selectedId;

    if (automaticTab === 'component' || automaticTab === 'elements') {
      setSelectedTabOverride(automaticTab);
    }
  }, [automaticTab, selectedId]);

  function renderTabContent() {
    switch (selectedTab) {
      case 'project':
        return <AyonProjectInspector name={name} onChangeName={onChangeName} />;
      case 'component':
        // If we have a selection of artboards, show the page inspector
        if (
          selectedArtboards.length > 0 &&
          selectedArtboards.length === selectedLayers.length
        ) {
          return <AyonPageInspector selectedArtboards={selectedArtboards} />;
        }

        return selectedCustomLayers.length > 1 ? (
          <AyonMultipleComponentsInspector layerIds={selectedCustomLayerIds} />
        ) : selectedCustomLayers.length === 1 ? (
          <CustomLayerInspector
            selectedLayer={selectedCustomLayers[0]}
            setPreviewNode={setPreviewNode}
          />
        ) : null;
      case 'elements':
        return selectedCustomLayers.length === 1 ? (
          <AyonElementsInspector
            selectedLayer={selectedCustomLayers[0]}
            highlightedPath={highlightedPath}
            setHighlightedPath={setHighlightedPath}
          />
        ) : null;
    }
  }

  const tabContent = renderTabContent();

  return (
    <Stack.V
      flex="1"
      background={'white'}
      width={'400px'}
      borderLeft={`1px solid ${theme.colors.dividerStrong}`}
    >
      <Stack.H padding={'12px'}>
        <RadioGroup.Root
          id={'inspector-tab'}
          value={selectedTab}
          onValueChange={(value: TabName) => {
            setSelectedTabOverride(value);
          }}
        >
          <RadioGroup.Item value="project">
            <Small>Project</Small>
          </RadioGroup.Item>
          <RadioGroup.Item value="component">
            <Small>Selection</Small>
          </RadioGroup.Item>
          <RadioGroup.Item value="elements">
            <Small>Elements</Small>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </Stack.H>
      <ScrollArea>
        {tabContent ? (
          <Stack.V
            gap="1px"
            position="relative"
            background={theme.colors.canvas.background}
          >
            {tabContent}
          </Stack.V>
        ) : (
          <NoSelection count={selectedCustomLayers.length} />
        )}
      </ScrollArea>
    </Stack.V>
  );
});

function NoSelection({ count }: { count: number }) {
  return (
    <Stack.V
      alignItems="center"
      justifyContent="center"
      position="absolute"
      inset="0"
    >
      <Small color="textDisabled">
        {count === 0 ? 'No selection' : 'Multiple components selected'}
      </Small>
    </Stack.V>
  );
}
