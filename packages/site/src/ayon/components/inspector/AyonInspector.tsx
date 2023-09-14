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
import React, { memo, useCallback, useEffect } from 'react';
import { NoyaNode } from '../../../dseditor/types';
import { CustomLayerData, NodePath } from '../../types';
import { AyonProjectInspector } from './AyonProjectInspector';
import { CustomLayerInspector } from './CustomLayerInspector';

type TabName = 'component' | 'project';

type Props = {
  name: string;
  onChangeName?: (name: string) => void;
  onDuplicate?: () => void;
  highlightedNodePath?: NodePath;
  setHighlightedNodePath: (value: NodePath | undefined) => void;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

export const AyonInspector = memo(function AyonInspector({
  name,
  onChangeName,
  onDuplicate,
  highlightedNodePath,
  setHighlightedNodePath,
  setPreviewNode,
}: Props) {
  const theme = useDesignSystemTheme();
  const [state] = useApplicationState();

  const selectedLayers = useShallowArray(
    Selectors.getSelectedLayers(state).filter(
      Layers.isCustomLayer<CustomLayerData>,
    ),
  );

  const highlightedPath =
    highlightedNodePath &&
    highlightedNodePath.layerId === selectedLayers[0]?.do_objectID
      ? highlightedNodePath.path
      : undefined;

  const setHighlightedPath = useCallback(
    (path: string[] | undefined) => {
      setHighlightedNodePath(
        selectedLayers[0] && path
          ? { layerId: selectedLayers[0].do_objectID, path }
          : undefined,
      );
    },
    [selectedLayers, setHighlightedNodePath],
  );

  const [selectedTabOverride, setSelectedTabOverride] = React.useState<
    TabName | undefined
  >(undefined);

  const automaticTab = selectedLayers.length > 0 ? 'component' : 'project';
  const selectedTab = selectedTabOverride ?? automaticTab;
  const selectedId = selectedLayers[0]?.do_objectID;

  // Set the override when the automatic tab changes or the selection changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    selectedId;

    if (automaticTab === 'component') {
      setSelectedTabOverride('component');
    }
  }, [automaticTab, selectedId]);

  return (
    <Stack.V
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
            <Small>Component</Small>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </Stack.H>
      <ScrollArea>
        {selectedTab === 'component' &&
          (selectedLayers.length === 1 ? (
            <CustomLayerInspector
              selectedLayer={selectedLayers[0]}
              highlightedPath={highlightedPath}
              setHighlightedPath={setHighlightedPath}
              setPreviewNode={setPreviewNode}
            />
          ) : (
            <Stack.V
              alignItems="center"
              justifyContent="center"
              position="absolute"
              inset="0"
            >
              <Small color="textDisabled">
                {selectedLayers.length === 0
                  ? 'No selection'
                  : 'Multiple components selected'}
              </Small>
            </Stack.V>
          ))}
        {selectedTab === 'project' && (
          <AyonProjectInspector
            name={name}
            onChangeName={onChangeName}
            onDuplicate={onDuplicate}
          />
        )}
      </ScrollArea>
    </Stack.V>
  );
});
