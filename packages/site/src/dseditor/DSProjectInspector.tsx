import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { fileOpen } from 'browser-fs-access';
import { produce } from 'immer';
import { DS } from 'noya-api';
import {
  Button,
  DropdownMenu,
  ExtractMenuItemType,
  IconButton,
  ListView,
  RelativeDropPosition,
  ScrollArea,
  Select,
  Spacer,
  Stack,
  Text,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { uuid } from 'noya-utils';
import React, { useState } from 'react';
import { AyonListRow } from '../ayon/components/inspector/AyonListPrimitives';
import { InspectorSection } from '../components/InspectorSection';
import { downloadBlob } from '../utils/download';
import { DSThemeInspector } from './DSThemeInspector';
import { FindComponent } from './traversal';
import { NoyaComponent } from './types';

const designSystems = {
  '@noya-design-system/mui': 'Material Design',
  '@noya-design-system/antd': 'Ant Design',
  '@noya-design-system/chakra': 'Chakra UI',
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
  onNewComponent: (componentID?: string) => void;
  onDeleteComponent: (componentID: string) => void;
  onSelectComponent: (componentID?: string) => void;
  onMoveComponent: (componentID: string, index: number) => void;
  findComponent: FindComponent;
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
  onSelectComponent,
  onMoveComponent,
  findComponent,
}: Props) {
  const theme = useDesignSystemTheme();
  const {
    source: { name: sourceName },
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
        const data = JSON.stringify(components);
        const file = new File([data], 'components.json', {
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
          const components = JSON.parse(data);
          setDS((state) =>
            produce(state, (draft) => {
              if (value === 'importAndDelete') {
                draft.components = [];
              }
              draft.components = components;
            }),
          );
        }
        break;
      }
    }
  };

  return (
    <Stack.V width="300px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
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
              keyExtractor={(component) => component.componentID}
              data={components}
              onMoveItem={(
                sourceIndex: number,
                destinationIndex: number,
                position: RelativeDropPosition,
              ) => {
                if (position === 'inside') return;

                onMoveComponent(
                  components[sourceIndex].componentID,
                  ListView.normalizeIndex(destinationIndex, position),
                );
              }}
              renderItem={(component) => {
                return (
                  <AyonListRow
                    id={component.componentID}
                    key={component.componentID}
                    name={component.name || 'Unnamed'}
                    selected={component.componentID === selectedComponentID}
                    onPress={() => onSelectComponent(component.componentID)}
                    menuItems={[
                      { value: 'rename', title: 'Rename' },
                      { value: 'delete', title: 'Delete' },
                    ]}
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
