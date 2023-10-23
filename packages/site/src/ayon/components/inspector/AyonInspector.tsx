import { useApplicationState } from 'noya-app-state-context';
import {
  RadioGroup,
  ScrollArea,
  Small,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { useShallowArray } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { DEFAULT_DESIGN_SYSTEM } from '../../../components/DSContext';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSThemeInspector } from '../../../dseditor/DSThemeInspector';
import { NoyaNode } from '../../../dseditor/types';
import { useAyonState } from '../../state/ayonState';
import { CustomLayerData, NodePath } from '../../types';
import { AyonElementsInspector } from './AyonElementsInspector';
import { AyonMultipleComponentsInspector } from './AyonMultipleComponentsInspector';
import { AyonPageInspector } from './AyonPageInspector';
import { AyonProjectInspector } from './AyonProjectInspector';
import { CustomLayerInspector } from './CustomLayerInspector';
import { DesignSystemPicker } from './DesignSystemPicker';

type Props = {
  name: string;
  onChangeName?: (name: string) => void;
  highlightedNodePath?: NodePath;
  setHighlightedNodePath: (value: NodePath | undefined) => void;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

const InspectorContainer = memo(function InspectorContainer({
  width,
  header,
  children,
  fallback,
}: {
  width: number | string;
  header?: React.ReactNode;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V flex="1" background="white" width={width} position="relative">
      {header}
      {children ? (
        <ScrollArea>
          <Stack.V
            gap="1px"
            position="relative"
            background={theme.colors.canvas.background}
          >
            {children}
          </Stack.V>
        </ScrollArea>
      ) : fallback ? (
        <Stack.V position="relative" height="100%">
          {fallback}
        </Stack.V>
      ) : null}
    </Stack.V>
  );
});

export const AyonInspector = memo(function AyonInspector({
  name,
  onChangeName,
  highlightedNodePath,
  setHighlightedNodePath,
  setPreviewNode,
}: Props) {
  type TabName = 'component' | 'elements';

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

  const automaticTab: TabName =
    selectedCustomLayers.length > 0 &&
    state.interactionState.type === 'editingBlock'
      ? 'elements'
      : 'component';
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
      case 'component':
        // If we have a selection of artboards, show the page inspector
        if (
          selectedArtboards.length > 0 &&
          selectedArtboards.length === selectedLayers.length
        ) {
          return (
            <AyonPageInspector
              projectName={name}
              selectedArtboards={selectedArtboards}
            />
          );
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
    <InspectorContainer
      width="400px"
      fallback={<NoSelection count={selectedCustomLayers.length} />}
      header={
        <Stack.H padding="12px">
          <RadioGroup.Root
            id="inspector-tab"
            value={selectedTab}
            onValueChange={(value: TabName) => {
              setSelectedTabOverride(value);
            }}
          >
            <RadioGroup.Item value="component">
              <Small>Selection</Small>
            </RadioGroup.Item>
            <RadioGroup.Item value="elements">
              <Small>Elements</Small>
            </RadioGroup.Item>
          </RadioGroup.Root>
        </Stack.H>
      }
    >
      {tabContent}
    </InspectorContainer>
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

export const AyonSidebar = memo(function AyonSidebar(
  props: Pick<Props, 'name' | 'onChangeName'>,
) {
  type TabName = 'project' | 'theme';

  const theme = useDesignSystemTheme();
  const [state, dispatch] = useAyonState();
  const [selectedTab, setSelectedTab] = React.useState<TabName>('project');

  return (
    <InspectorContainer
      width={theme.sizes.sidebarWidth}
      header={
        <Stack.H padding="12px">
          <RadioGroup.Root
            id="inspector-tab"
            value={selectedTab}
            onValueChange={setSelectedTab}
          >
            <RadioGroup.Item value="project">
              <Small>Project</Small>
            </RadioGroup.Item>
            <RadioGroup.Item value="theme">
              <Small>Theme</Small>
            </RadioGroup.Item>
          </RadioGroup.Root>
        </Stack.H>
      }
    >
      {selectedTab === 'project' ? (
        <AyonProjectInspector {...props} />
      ) : (
        <InspectorSection title="Theme" titleTextStyle="heading3">
          <InspectorPrimitives.LabeledRow label="Design System">
            <DesignSystemPicker />
          </InspectorPrimitives.LabeledRow>
          <DSThemeInspector
            dsConfig={
              (state.sketch.document.designSystem ?? DEFAULT_DESIGN_SYSTEM)
                .config
            }
            onChangeDSConfig={(config) => {
              dispatch('setDesignSystemConfig', config);
            }}
          />
        </InspectorSection>
      )}
    </InspectorContainer>
  );
});
