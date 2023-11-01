import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { fileOpen } from 'browser-fs-access';
import { produce } from 'immer';
import { DS, asyncIterableToString, useNoyaClientOrFallback } from 'noya-api';
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
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { uuid } from 'noya-utils';
import React from 'react';
import { AyonListRow } from '../ayon/components/inspector/AyonListPrimitives';
import { AutoResizingTextArea } from '../ayon/components/inspector/DescriptionTextArea';
import { InspectorSection } from '../components/InspectorSection';
import { downloadBlob } from '../utils/download';
import { DSThemeInspector } from './DSThemeInspector';
import { Model } from './builders';
import { exportLayout, parseLayout } from './componentLayout';
import { FindComponent, instantiateResolvedComponent } from './traversal';
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
  findComponent: FindComponent;
}

const DEFAULT_PROMPTS = {
  pickComponent: `Given this list of component: {{componentNames}}, pick the one that matches this description: {{inputDescription}}. Answer with ONLY the string name of the component.`,
  populateTemplate: `I have the following JSX + tailwind v3 template snippet:

\`\`\`jsx
{{componentTemplate}}
\`\`\`

Update this template's content to match the component description: {{inputDescription}}. If the template contains a repeated elements, you may modify the number of elements. You may remove elements that aren't needed. Do not change the visual style of the component.`,
  inputDescription: `Order History Sidebar`,
};

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
  const client = useNoyaClientOrFallback();
  const theme = useDesignSystemTheme();
  const {
    source: { name: sourceName },
  } = ds;

  const createAIComponent = async () => {
    const componentNames = components.map((c) => c.name);

    function getComponentTemplateCode(componentName: string) {
      const component = components.find(
        (c) => c.name.toLowerCase() === componentName.toLowerCase(),
      );

      if (!component) {
        console.error(`component not found: ${componentName}`);
        return;
      }

      const resolvedNode = instantiateResolvedComponent(findComponent, {
        componentID: component.componentID,
      });

      return exportLayout(resolvedNode);
    }

    function insertDataIntoTemplate(
      template: string,
      {
        componentName,
        inputDescription,
      }: { componentName?: string; inputDescription?: string },
    ) {
      template = template.replace(
        '{{componentNames}}',
        componentNames.join(', '),
      );
      if (componentName) {
        template = template.replace(
          '{{componentTemplate}}',
          getComponentTemplateCode(componentName) ?? '',
        );
      }
      template = template.replace(
        '{{inputDescription}}',
        inputDescription ?? '',
      );
      return template;
    }

    console.info('component names', componentNames);
    console.info(
      'component template',
      getComponentTemplateCode(components[0].name),
    );

    const pickComponentPrompt = insertDataIntoTemplate(
      ds.prompt?.pickComponent || DEFAULT_PROMPTS.pickComponent,
      {
        inputDescription:
          ds.prompt?.inputDescription || DEFAULT_PROMPTS.inputDescription,
      },
    );

    console.info('pick component prompt', pickComponentPrompt);

    const chooseComponentIterator =
      await client.networkClient.generate.fromPrompt(pickComponentPrompt);

    const chosenComponentName = await asyncIterableToString(
      chooseComponentIterator,
    );

    console.info('chosen component name', chosenComponentName);

    const component = components.find(
      (c) => c.name.toLowerCase() === chosenComponentName.toLowerCase(),
    );

    if (!component) {
      console.error(`component not found: ${chosenComponentName}`);
      return;
    }

    const populateTemplatePrompt = insertDataIntoTemplate(
      ds.prompt?.populateTemplate || DEFAULT_PROMPTS.populateTemplate,
      {
        componentName: chosenComponentName,
        inputDescription:
          ds.prompt?.inputDescription || DEFAULT_PROMPTS.inputDescription,
      },
    );

    console.info('populate template prompt', populateTemplatePrompt);

    const iterator = await client.networkClient.generate.fromPrompt(
      populateTemplatePrompt,
    );

    const result = await asyncIterableToString(iterator);

    console.info('result', result);

    const noyaNode = parseLayout(result, 'geometric');
    const newComponent = Model.component({
      name: ds.prompt?.inputDescription ?? DEFAULT_PROMPTS.inputDescription,
      componentID: uuid(),
      rootElement: noyaNode,
    });

    setDS((state) =>
      produce(state, (draft) => {
        draft.components?.push(newComponent);
      }),
    );
  };

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
          <InspectorSection title="Prompt" titleTextStyle="heading4">
            <InspectorPrimitives.LabeledRow label="Input Description">
              <AutoResizingTextArea
                value={
                  ds.prompt?.inputDescription ||
                  DEFAULT_PROMPTS.inputDescription
                }
                onChangeText={(prompt) =>
                  setDS((state) =>
                    produce(state, (draft) => {
                      if (!draft.prompt) draft.prompt = {};
                      draft.prompt.inputDescription = prompt;
                    }),
                  )
                }
              />
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow label="Pick Component Prompt">
              <AutoResizingTextArea
                value={
                  ds.prompt?.pickComponent || DEFAULT_PROMPTS.pickComponent
                }
                onChangeText={(prompt) =>
                  setDS((state) =>
                    produce(state, (draft) => {
                      if (!draft.prompt) draft.prompt = {};
                      draft.prompt.pickComponent = prompt;
                    }),
                  )
                }
              />
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow label="Populate Template Prompt">
              <AutoResizingTextArea
                value={
                  ds.prompt?.populateTemplate ||
                  DEFAULT_PROMPTS.populateTemplate
                }
                onChangeText={(prompt) =>
                  setDS((state) =>
                    produce(state, (draft) => {
                      if (!draft.prompt) draft.prompt = {};
                      draft.prompt.populateTemplate = prompt;
                    }),
                  )
                }
              />
            </InspectorPrimitives.LabeledRow>
            <Button onClick={createAIComponent}>Create AI Component</Button>
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
          <InspectorSection
            title="Components"
            titleTextStyle="heading4"
            right={
              <>
                <IconButton iconName="PlusIcon" onClick={onNewComponent} />
                <Spacer.Horizontal size={12} />
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
