import {
  Button,
  DropdownMenu,
  ExtractMenuItemType,
  IconButton,
  InputField,
  ListView,
  RelativeDropPosition,
  ScrollArea,
  Select,
  Spacer,
  Stack,
  Text,
  createSectionedMenu,
  useDesignSystemTheme,
} from '@noya-app/noya-designsystem';
import {
  ChevronDownIcon,
  InputIcon,
  OpenInNewWindowIcon,
  TrashIcon,
} from '@noya-app/noya-icons';
import { findLastIndex, uuid } from '@noya-app/noya-utils';
import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { fileOpen } from 'browser-fs-access';
import { produce } from 'immer';
import { DS, useNoyaClientOrFallback } from 'noya-api';
import {
  ComponentGroup,
  ComponentGroupTree,
  FindComponent,
  NoyaComponent,
  createRootGroup,
  flattenComponentGroups,
  getSavableComponentGroups,
} from 'noya-component';
import { InspectorPrimitives } from 'noya-inspector';
import React, { useState } from 'react';
import {
  AyonListRow,
  AyonListSectionHeader,
} from '../ayon/components/inspector/AyonListPrimitives';
import { InspectorSection } from '../components/InspectorSection';
import { LibraryVersionPicker } from '../components/LibraryVersionPicker';
import { StyledAnchor } from '../components/NavigationLinks';
import { downloadBlob } from '../utils/download';
import { DSThemeInspector } from './DSThemeInspector';

const designSystems = {
  vanilla: 'None',
  '@noya-design-system/chakra': 'Chakra UI',
  '@noya-design-system/antd': 'Ant Design',
  '@noya-design-system/mui': 'Material Design',
};
const noop = () => {};

interface Props {
  name: string;
  onChangeName?: (name: string) => void;
  system?: DesignSystemDefinition;
  ds: DS;
  setDS: React.Dispatch<React.SetStateAction<DS>>;
  selectedComponentID?: string;
  components: NoyaComponent[];
  onNewComponent: (componentID?: string, groupID?: string) => void;
  onDeleteComponent: (componentID: string) => void;
  onDuplicateComponent: (componentID: string) => void;
  onSelectComponent: (componentID?: string) => void;
  onMoveComponent: (
    componentID: string,
    index: number,
    groupID?: string,
  ) => void;
  findComponent: FindComponent;
  groups?: ComponentGroup[];
  onDeleteGroup?: (groupID: string) => void;
}

export function DSProjectInspector({
  name: fileName,
  onChangeName = noop,
  system,
  ds,
  setDS,
  selectedComponentID,
  components,
  onNewComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onSelectComponent,
  onMoveComponent,
  findComponent,
  groups,
  onDeleteGroup,
}: Props) {
  const theme = useDesignSystemTheme();
  const {
    source: { name: sourceName, version: sourceVersion },
  } = ds;
  const [renamingComponent, setRenamingComponent] = useState<
    string | undefined
  >();

  const componentsMenuItems = createSectionedMenu([
    { value: 'export', title: 'Export All' },
    { value: 'import', title: 'Import All...' },
    {
      value: 'importAndDelete',
      title: 'Import All and Delete Existing...',
    },
  ]);

  const handleSelectComponentsMenuItem = async (
    value: ExtractMenuItemType<(typeof componentsMenuItems)[number]>,
  ) => {
    switch (value) {
      case 'export': {
        const data = JSON.stringify({ groups, components });
        const file = new File([data], 'ds.json', {
          type: 'application/json',
        });
        downloadBlob(file);
        break;
      }
      case 'importAndDelete':
      case 'import': {
        const file = await fileOpen({
          extensions: ['.json'],
          mimeTypes: ['application/json'],
        });
        if (file) {
          const data = await file.text();
          const parsed = JSON.parse(data) as
            | NoyaComponent[]
            | { groups?: ComponentGroup[]; components?: NoyaComponent[] };
          const normalized = Array.isArray(parsed)
            ? { components: parsed }
            : parsed;

          setDS((state) =>
            produce(state, (draft) => {
              if (value === 'importAndDelete') {
                draft.components = [];
                draft.groups = [];
              }
              draft.components = normalized.components;
              draft.groups = normalized.groups;
            }),
          );
        }
        break;
      }
    }
  };

  const componentItems = flattenComponentGroups({ groups, components });
  const client = useNoyaClientOrFallback();

  return (
    <Stack.V width="300px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          {ds.latestBuildAssetId && (
            <InspectorSection title="Build" titleTextStyle="heading4">
              <StyledAnchor
                href={`${client.assets.url(ds.latestBuildAssetId)}/index.html`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Latest Build <OpenInNewWindowIcon />
              </StyledAnchor>
              <InputField.Root labelPosition="end" labelSize={50}>
                <InputField.Label>Asset ID</InputField.Label>
                <InputField.Input value={ds.latestBuildAssetId} readOnly />
              </InputField.Root>
            </InspectorSection>
          )}
          <InspectorSection title="Theme" titleTextStyle="heading4">
            <InspectorPrimitives.LabeledRow label="Base Library">
              <Select
                id="design-system"
                value={sourceName}
                options={Object.keys(designSystems)}
                getTitle={(value) =>
                  designSystems[value as keyof typeof designSystems]
                }
                onChange={(value) => {
                  setDS((state) =>
                    produce(state, (draft) => {
                      draft.source.name = value;
                    }),
                  );
                }}
              >
                <Button flex="1">
                  {designSystems[sourceName as keyof typeof designSystems]}
                  <Spacer.Horizontal />
                  <ChevronDownIcon />
                </Button>
              </Select>
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow label="Library Version">
              <LibraryVersionPicker
                libraryName={sourceName}
                version={sourceVersion}
                onChange={(newVersion) => {
                  setDS((state) =>
                    produce(state, (draft) => {
                      draft.source.version = newVersion;
                    }),
                  );
                }}
              />
            </InspectorPrimitives.LabeledRow>
            <DSThemeInspector
              dsConfig={ds.config}
              onChangeDSConfig={(config) => {
                setDS((state) =>
                  produce(state, (draft) => {
                    draft.config = config;
                  }),
                );
              }}
            />
          </InspectorSection>
          <InspectorSection
            title="Components"
            titleTextStyle="heading4"
            onClickTitle={() => {
              onSelectComponent(undefined);
            }}
            right={
              <>
                <IconButton
                  iconName="PlusIcon"
                  onClick={() => {
                    const componentID = uuid();
                    onNewComponent(componentID);
                    setRenamingComponent(componentID);
                  }}
                />
                <Spacer.Horizontal size={8} />
                <DropdownMenu
                  items={componentsMenuItems}
                  onSelect={handleSelectComponentsMenuItem}
                >
                  <IconButton iconName="DotsVerticalIcon"></IconButton>
                </DropdownMenu>
              </>
            }
          >
            <ListView.Root
              variant="bare"
              sortable
              gap={4}
              keyExtractor={(item) => item.value.id}
              data={componentItems}
              acceptsDrop={(sourceIndex, destinationIndex, position) => {
                const sourceItem = componentItems[sourceIndex];
                const destinationItem = componentItems[destinationIndex];

                if (
                  sourceItem.type === 'group' &&
                  destinationItem.type === 'group'
                ) {
                  return true;
                } else if (sourceItem.type === 'item') {
                  if (
                    destinationItem.type === 'group' &&
                    position === 'inside'
                  ) {
                    return true;
                  } else if (
                    destinationItem.type === 'item' &&
                    position !== 'inside'
                  ) {
                    return true;
                  }
                }

                return false;
              }}
              onMoveItem={(
                sourceIndex: number,
                destinationIndex: number,
                position: RelativeDropPosition,
              ) => {
                const sourceItem = componentItems[sourceIndex];
                const destinationItem = componentItems[destinationIndex];

                if (position === 'inside') {
                  if (
                    sourceItem.type === 'group' &&
                    destinationItem.type === 'group'
                  ) {
                    const newRoot = ComponentGroupTree.move(
                      createRootGroup(groups),
                      {
                        indexPaths: [sourceItem.indexPath],
                        to: [
                          ...destinationItem.indexPath,
                          destinationItem.value.children?.length ?? 0,
                        ],
                      },
                    );

                    setDS((state) =>
                      produce(state, (draft) => {
                        draft.groups = getSavableComponentGroups(newRoot);
                      }),
                    );
                  } else if (
                    sourceItem.type === 'item' &&
                    destinationItem.type === 'group'
                  ) {
                    let lastChildOfGroupIndex = findLastIndex(
                      components,
                      (c) => c.groupID === destinationItem.value.id,
                    );

                    if (lastChildOfGroupIndex === -1) {
                      lastChildOfGroupIndex = 0;
                    } else {
                      lastChildOfGroupIndex += 1;
                    }

                    onMoveComponent(
                      sourceItem.value.componentID,
                      lastChildOfGroupIndex,
                      destinationItem.value.id,
                    );
                  }

                  return;
                }

                if (
                  sourceItem.type !== 'item' ||
                  destinationItem.type !== 'item'
                ) {
                  return;
                }

                const destinationIndexInComponents = components.findIndex(
                  (c) => c.componentID === destinationItem.value.componentID,
                );

                onMoveComponent(
                  sourceItem.value.componentID,
                  ListView.normalizeIndex(
                    destinationIndexInComponents,
                    position,
                  ),
                  destinationItem.value.groupID,
                );
              }}
              renderItem={(item) => {
                if (item.type === 'group') {
                  return (
                    <AyonListSectionHeader
                      id={item.value.id}
                      key={item.value.id}
                      depth={item.depth}
                      tabIndex={0}
                      onChangeExpanded={() => {}}
                      isExpanded={true}
                      right={
                        <IconButton
                          iconName="PlusIcon"
                          onClick={() => {
                            const componentID = uuid();
                            onNewComponent(componentID, item.value.id);
                            setRenamingComponent(componentID);
                          }}
                        />
                      }
                      menuItems={[
                        {
                          value: 'rename',
                          title: 'Rename',
                          icon: <InputIcon />,
                        },
                        {
                          value: 'delete',
                          title: 'Delete',
                          icon: <TrashIcon />,
                        },
                      ]}
                      onSelectMenuItem={(value) => {
                        switch (value) {
                          case 'delete':
                            onDeleteGroup?.(item.value.id);
                            break;
                        }
                      }}
                    >
                      {item.value.name}
                    </AyonListSectionHeader>
                  );
                }

                const component = item.value;

                return (
                  <AyonListRow
                    id={component.id}
                    key={component.id}
                    depth={item.depth}
                    name={component.name || 'Unnamed'}
                    selected={component.componentID === selectedComponentID}
                    onPress={() => onSelectComponent(component.componentID)}
                    menuItems={[
                      { value: 'rename', title: 'Rename' },
                      { value: 'duplicate', title: 'Duplicate' },
                      { value: 'delete', title: 'Delete' },
                    ]}
                    backgroundColor={
                      component.accessModifier === 'internal'
                        ? theme.colors.listView.raisedBackground
                        : undefined
                    }
                    isLoading={false}
                    isDragging={false}
                    isEditing={renamingComponent === component.componentID}
                    isSuggestedPage={false}
                    handleSubmitEditing={(newName) => {
                      setRenamingComponent(undefined);
                      setDS((state) =>
                        produce(state, (draft) => {
                          const components =
                            (draft.components as NoyaComponent[]) ?? [];
                          const found = components.find(
                            (c) => c.componentID === component.componentID,
                          );
                          if (found) found.name = newName;
                        }),
                      );
                    }}
                    onDoubleClick={() => {
                      setRenamingComponent(component.componentID);
                    }}
                    onSelectMenuItem={(value) => {
                      switch (value) {
                        case 'delete':
                          onDeleteComponent(component.componentID);
                          break;
                        case 'rename':
                          setRenamingComponent(component.componentID);
                          break;
                        case 'duplicate':
                          onDuplicateComponent(component.componentID);
                          break;
                      }
                    }}
                  />
                );
              }}
            />
          </InspectorSection>
          {system && (
            <InspectorSection title="Library Details" titleTextStyle="heading4">
              {system.dependencies && (
                <Stack.V>
                  <InspectorPrimitives.SectionHeader>
                    <InspectorPrimitives.Title>
                      Dependencies
                    </InspectorPrimitives.Title>
                  </InspectorPrimitives.SectionHeader>
                  <Spacer.Vertical size={8} />
                  <Stack.V background={theme.colors.codeBackground}>
                    <ListView.Root>
                      {Object.entries(system.dependencies).map(
                        ([key, value]) => (
                          <ListView.Row key={key}>
                            <Text variant="code" flex="1">
                              {key}
                            </Text>
                            <Text variant="code">{value}</Text>
                          </ListView.Row>
                        ),
                      )}
                    </ListView.Root>
                  </Stack.V>
                </Stack.V>
              )}
            </InspectorSection>
          )}
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );
}
