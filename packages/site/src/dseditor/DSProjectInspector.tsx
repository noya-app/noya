import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { produce } from 'immer';
import { DS } from 'noya-api';
import {
  Button,
  InputField,
  ListView,
  RelativeDropPosition,
  ScrollArea,
  Select,
  Spacer,
  Stack,
  Text,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import React from 'react';
import { AyonListRow } from '../ayon/components/inspector/AyonListPrimitives';
import { InspectorSection } from '../components/InspectorSection';
import { DSThemeInspector } from './DSThemeInspector';
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
  onNewComponent: () => void;
  onDeleteComponent: (componentID: string) => void;
  onSelectComponent: (componentID: string) => void;
  onMoveComponent: (componentID: string, index: number) => void;
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
}: Props) {
  const theme = useDesignSystemTheme();
  const {
    source: { name: sourceName },
  } = ds;

  return (
    <Stack.V width="300px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection title="Design System" titleTextStyle="heading3">
            <InspectorPrimitives.LabeledRow label="Name">
              <InputField.Root>
                <InputField.Input
                  placeholder="Untitled"
                  value={fileName}
                  onSubmit={onChangeName}
                />
              </InputField.Root>
            </InspectorPrimitives.LabeledRow>
          </InspectorSection>
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
          <InspectorSection title="Components" titleTextStyle="heading4">
            <ListView.Root
              variant="bare"
              sortable
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
                    menuItems={[{ value: 'delete', title: 'Delete' }]}
                    isLoading={false}
                    isDragging={false}
                    isEditing={false}
                    isSuggestedPage={false}
                    handleSubmitEditing={() => {}}
                    onSelectMenuItem={(value) => {
                      switch (value) {
                        case 'delete':
                          onDeleteComponent(component.componentID);
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
