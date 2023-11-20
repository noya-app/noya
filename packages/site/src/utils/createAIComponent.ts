import produce from 'immer';
import { DS, NoyaAPI, asyncIterableToString } from 'noya-api';
import {
  FindComponent,
  Model,
  NoyaComponent,
  instantiateResolvedComponent,
} from 'noya-component';
import { uuid } from 'noya-utils';
import { exportLayout, parseLayout } from '../dseditor/componentLayout';

const DEFAULT_PROMPTS = {
  pickComponent: `Given this list of component: {{componentNames}}, pick the one that matches this description: {{inputDescription}}. Answer with ONLY the string name of the component.`,
  populateTemplate: `I have the following JSX + tailwind v3 template snippet:

\`\`\`jsx
{{componentTemplate}}
\`\`\`

Update this template's content to match the component description: {{inputDescription}}. If the template contains a repeated elements, you may modify the number of elements. You may remove elements that aren't needed. Do not change the visual style of the component.`,
  inputDescription: `Order History Sidebar`,
};

export async function createAIComponent({
  ds,
  setDS,
  client,
  findComponent,
  components,
}: {
  ds: DS;
  setDS: React.Dispatch<React.SetStateAction<DS>>;
  client: NoyaAPI.Client;
  findComponent: FindComponent;
  components: NoyaComponent[];
}) {
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
    template = template.replace('{{inputDescription}}', inputDescription ?? '');
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
}

// <InspectorSection title="Design System" titleTextStyle="heading3">
//   <InspectorPrimitives.LabeledRow label="Name">
//     <InputField.Root>
//       <InputField.Input
//         placeholder="Untitled"
//         value={fileName}
//         onSubmit={onChangeName}
//       />
//     </InputField.Root>
//   </InspectorPrimitives.LabeledRow>
//   </InspectorSection>
//   <InspectorSection title="Prompt" titleTextStyle="heading4">
//   <InspectorPrimitives.LabeledRow label="Input Description">
//     <AutoResizingTextArea
//       value={
//         ds.prompt?.inputDescription ||
//         DEFAULT_PROMPTS.inputDescription
//       }
//       onChangeText={(prompt) =>
//         setDS((state) =>
//           produce(state, (draft) => {
//             if (!draft.prompt) draft.prompt = {};
//             draft.prompt.inputDescription = prompt;
//           }),
//         )
//       }
//     />
//   </InspectorPrimitives.LabeledRow>
//   <InspectorPrimitives.LabeledRow label="Pick Component Prompt">
//     <AutoResizingTextArea
//       value={
//         ds.prompt?.pickComponent || DEFAULT_PROMPTS.pickComponent
//       }
//       onChangeText={(prompt) =>
//         setDS((state) =>
//           produce(state, (draft) => {
//             if (!draft.prompt) draft.prompt = {};
//             draft.prompt.pickComponent = prompt;
//           }),
//         )
//       }
//     />
//   </InspectorPrimitives.LabeledRow>
//   <InspectorPrimitives.LabeledRow label="Populate Template Prompt">
//     <AutoResizingTextArea
//       value={
//         ds.prompt?.populateTemplate ||
//         DEFAULT_PROMPTS.populateTemplate
//       }
//       onChangeText={(prompt) =>
//         setDS((state) =>
//           produce(state, (draft) => {
//             if (!draft.prompt) draft.prompt = {};
//             draft.prompt.populateTemplate = prompt;
//           }),
//         )
//       }
//     />
//   </InspectorPrimitives.LabeledRow>
//   <Button onClick={createAIComponent}>Create AI Component</Button>
// </InspectorSection>
