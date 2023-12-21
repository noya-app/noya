/* eslint-disable testing-library/render-result-naming-convention */
import {
  component,
  DesignSystemDefinition,
  Theme,
  x,
} from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  compile,
  compileAsync,
  createElementCode,
  createExpressionCode,
  createSimpleElement,
} from 'noya-compiler';
import {
  createResolvedNode,
  FindComponent,
  Model,
  renderResolvedNode,
} from 'noya-component';
import { loadDesignSystem } from 'noya-module-loader';
import { tailwindColors } from 'noya-tailwind';
import { uuid } from 'noya-utils';
import ts from 'typescript';
import { clean } from '../clean';
import { createPassthrough, simpleElement } from '../common';
import {
  convertTransformer,
  ConvertTransformerContext,
  generateThemeFile,
} from '../compileTheme';
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
  ChakraDesignSystem = await loadDesignSystem(
    '@noya-design-system/chakra',
    'latest',
  );
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
    name: '@noya-design-system/chakra',
    type: 'npm',
    version: '0.0.1',
  },
};

describe('builders', () => {
  it('empty object', () => {
    expect(print(createExpressionCode({}))).toEqual('{}');
  });

  it('object with key', () => {
    expect(print(createExpressionCode({ foo: 'bar' }))).toEqual(
      '{ foo: "bar" }',
    );
  });

  it('object with hypenated key', () => {
    expect(print(createExpressionCode({ 'foo-bar': 'bar' }))).toEqual(
      '{ "foo-bar": "bar" }',
    );
  });

  it('converts empty element', () => {
    const expression = createElementCode(
      simpleElement({
        name: 'Box',
        props: {},
        children: [],
      }),
    );

    expect(print(expression)).toEqual('<Box />');
  });

  it('converts element with props', () => {
    const expression = createElementCode(
      simpleElement({
        name: 'Box',
        props: { foo: 'bar' },
        children: [],
      }),
    );

    expect(print(expression)).toEqual('<Box foo="bar"/>');
  });

  it('converts element with array with one child', () => {
    const expression = createElementCode(
      simpleElement({
        name: 'Box',
        props: {},
        children: ['foo'],
      }),
    );

    expect(print(expression)).toEqual('<Box>foo</Box>');
  });

  it('converts element with element prop', () => {
    const expression = createElementCode(
      simpleElement({
        name: 'Box',
        props: {
          foo: simpleElement({
            name: 'Box',
            props: {},
            children: [],
          }),
        },
        children: [],
      }),
    );

    expect(print(expression)).toEqual('<Box foo={<Box />}/>');
  });

  it('converts element with element array prop', () => {
    const expression = createElementCode(
      simpleElement({
        name: 'Box',
        props: {
          foo: [
            simpleElement({
              name: 'Box',
              props: {},
              children: [],
            }),
          ],
        },
        children: [],
      }),
    );

    expect(print(expression)).toEqual('<Box foo={[<Box />]}/>');
  });

  it('passes through prop', () => {
    const passthrough = ts.factory.createIdentifier('passthrough');

    const expression = createElementCode(
      simpleElement({
        name: 'Box',
        props: {
          foo: createPassthrough(passthrough),
        },
        children: [],
      }),
    );

    expect(print(expression)).toEqual('<Box foo={passthrough}/>');
  });
});

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

  const resolvedNode = createResolvedNode({
    findComponent,
    node: noyaComponent.rootElement,
  });

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
  const emptyContext: ConvertTransformerContext = {
    namespaceMap: new Map(),
    imports: [],
  };

  it('access key', () => {
    const result = convertTransformer(
      { theme: 'foo' },
      x.a('theme'),
      emptyContext,
    );

    expect(print(result)).toEqual(`"foo"`);
  });

  it('access path', () => {
    const result = convertTransformer(
      { theme: { a: 'foo', b: 'bar' } },
      x.a('theme.b'),
      emptyContext,
    );

    expect(print(result)).toEqual(`"bar"`);
  });

  it('access indirection', () => {
    const result = convertTransformer(
      { theme: { a: 'foo', b: 'bar' }, key: 'theme.b' },
      x.a(x.a('key')),
      emptyContext,
    );

    expect(print(result)).toEqual(`"bar"`);
  });

  it('access inline data', () => {
    const result = convertTransformer(
      { key: 'theme.b' },
      x.a(x.a('key'), { theme: { a: 'foo', b: 'bar' } }),
      emptyContext,
    );

    expect(print(result)).toEqual(`"bar"`);
  });

  it('access inline data function', () => {
    const f = () => {};

    const context = {
      imports: [],
      namespaceMap: new Map([[f, { name: 'fn', source: 'foo' }]]),
    };

    const result = convertTransformer(
      { key: 'theme.b' },
      x.a(x.a('key'), { theme: { a: 'foo', b: f } }),
      context,
    );

    expect(print(result)).toEqual(`fn`);
  });

  it('nested namespace', () => {
    const ref = {};

    const context: ConvertTransformerContext = {
      imports: [],
      namespaceMap: new Map([
        [ref, { name: 'ref', source: 'foo', accessPath: ['member'] }],
      ]),
    };

    const result = convertTransformer(
      { theme: { a: 'foo', b: ref } },
      x.a('theme.b'),
      context,
    );

    expect(print(result)).toEqual(`ref.member`);
  });

  it('namespace reserved word', () => {
    const ref = {};

    const context: ConvertTransformerContext = {
      imports: [],
      namespaceMap: new Map([[ref, { name: 'theme', source: 'foo' }]]),
    };

    const result = convertTransformer({ theme: ref }, x.a('theme'), context);

    expect(print(result)).toEqual(`_theme`);
  });

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

describe('project', () => {
  it('generates project', () => {
    const files = compile({
      ds,
      name: 'Chakra',
      resolvedDefinitions: {
        '@noya-design-system/chakra': ChakraDesignSystem,
      },
    });

    expect(Object.keys(files)).toMatchSnapshot();
  });

  it('generates vanilla project', async () => {
    const files = await compileAsync({
      ds,
      name: 'Vanilla',
      definitions: ['vanilla'],
    });

    expect(files).toMatchSnapshot();
  });
});
