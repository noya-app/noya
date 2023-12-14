/* eslint-disable testing-library/render-result-naming-convention */
import {
  component,
  DesignSystemDefinition,
  Theme,
} from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import { createElementCode, createSimpleElement } from 'noya-compiler';
import {
  createResolvedNode,
  FindComponent,
  Model,
  renderResolvedNode,
} from 'noya-component';
import { loadDesignSystem } from 'noya-module-loader';
import { tailwindColors } from 'noya-tailwind';
import { uuid } from 'noya-utils';
import { clean } from '../clean';
import { generateThemeFile } from '../compileTheme';
import { print } from '../print';

const HeroComponent = Model.component({
  name: 'Hero',
  componentID: uuid(),
  rootElement: Model.primitiveElement({
    id: 'box',
    name: 'Content',
    classNames: Model.classNames([
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'p-10',
      'flex-1',
      'gap-4',
    ]),
    componentID: component.id.Box,
    children: [
      Model.primitiveElement({
        componentID: component.id.Tag,
        children: [Model.string('New')],
      }),
      Model.primitiveElement({
        name: 'Title',
        componentID: component.id.Text,
        children: [Model.string('Create, iterate, inspire.')],
        classNames: Model.classNames([
          'variant-h1',
          'leading-none',
          'text-center',
        ]),
      }),
      Model.primitiveElement({
        name: 'Subtitle',
        componentID: component.id.Text,
        children: [Model.string('Turn great ideas into new possibilities.')],
        classNames: Model.classNames([
          'variant-h4',
          'leading-none',
          'text-center',
        ]),
      }),
      Model.primitiveElement({
        id: 'a',
        name: 'Actions Row',
        classNames: Model.classNames(['flex', 'items-center', 'gap-4', 'mt-2']),
        componentID: component.id.Box,
        children: [
          Model.primitiveElement({
            componentID: component.id.Button,
            children: [Model.string('Get Started')],
          }),
          Model.primitiveElement({
            componentID: component.id.Link,
            children: [Model.string('Learn More')],
          }),
        ],
      }),
    ],
  }),
});

jest.setTimeout(20000);

let ChakraDesignSystem: DesignSystemDefinition;
// let MaterialDesignSystem: DesignSystemDefinition;

beforeAll(async () => {
  ChakraDesignSystem = await loadDesignSystem('chakra');
  // MaterialDesignSystem = await loadDesignSystem('mui');
});

const ds: DS = {
  components: [HeroComponent],
  config: {
    colorMode: 'light',
    colors: {
      primary: 'violet',
    },
  },
  source: {
    name: 'chakra',
    type: 'npm',
    version: '0.0.1',
  },
};

describe('renders', () => {
  const findComponent: FindComponent = (componentID) => {
    return ds.components?.find(
      (component) => component.componentID === componentID,
    );
  };

  const noyaComponent = findComponent(HeroComponent.componentID);

  if (!noyaComponent) {
    throw new Error(
      `Could not find component with id ${HeroComponent.componentID}`,
    );
  }

  const resolvedNode = createResolvedNode(
    findComponent,
    noyaComponent.rootElement,
  );

  test('default', () => {
    const reactNode = renderResolvedNode({
      contentEditable: false,
      disableTabNavigation: false,
      includeDataProps: false,
      system: ChakraDesignSystem,
      dsConfig: ds.config,
      resolvedNode,
    });

    const code = createElementCode(
      createSimpleElement(reactNode, ChakraDesignSystem)!,
    );

    const out = clean(print(code));

    expect(out).toMatchSnapshot();
  });

  test('classnames', () => {
    const reactNode = renderResolvedNode({
      contentEditable: false,
      disableTabNavigation: false,
      includeDataProps: false,
      system: ChakraDesignSystem,
      dsConfig: ds.config,
      resolvedNode,
      stylingMode: 'tailwind',
    });

    const code = createElementCode(
      createSimpleElement(reactNode, ChakraDesignSystem)!,
    );

    const out = clean(print(code));

    expect(out).toMatchSnapshot();
  });
});

describe('theme', () => {
  it('generates transformer', () => {
    const config = ds.config;

    const theme: Theme = {
      colorMode: config.colorMode ?? 'light',
      colors: {
        primary: (tailwindColors as any)[config.colors.primary],
        neutral: tailwindColors.slate,
      },
    };

    const transformer = generateThemeFile(ChakraDesignSystem, { theme });

    expect(transformer).toMatchSnapshot();
  });
});
