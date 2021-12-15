import {
  createBaseFileSystem,
  createTypescriptEnvironment,
  Element,
  ElementAttributes,
  getComponentLayer,
  printSourceFile,
  setFunctionName,
  TypescriptEnvironment,
} from 'noya-typescript';
import ts, { SourceFile } from 'typescript';

let env: TypescriptEnvironment;

beforeAll(async () => {
  const baseFileSystem = await createBaseFileSystem();
  env = createTypescriptEnvironment(baseFileSystem);
});

const filename = 'test.tsx';

it('gets component layer', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const componentLayer = getComponentLayer(sourceFile);

  expect(componentLayer).toMatchSnapshot();
});

it('gets component layer with attributes', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View name={"test"}></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const componentLayer = getComponentLayer(sourceFile);

  expect(componentLayer).toMatchSnapshot();
});

it('set element name', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View name={"test"}></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const componentLayer = getComponentLayer(sourceFile);
  const attribute = componentLayer!.element.attributes['name'];

  if (!attribute || attribute.type !== 'stringLiteral')
    throw new Error('Bad attribute');

  const result = ElementAttributes.setAttribute(
    sourceFile,
    componentLayer!.element.indexPath,
    'name',
    'hello',
  );

  expect(printSourceFile(result)).toMatchSnapshot();
});

it('add and remove attribute', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const componentLayer = getComponentLayer(sourceFile);

  const result = ElementAttributes.addAttribute(
    sourceFile,
    componentLayer!.element.indexPath,
    'name',
    'hello',
  );

  expect(printSourceFile(result)).toMatchSnapshot();

  const removed = ElementAttributes.removeAttribute(
    result,
    componentLayer!.element.indexPath,
    'name',
  );

  expect(printSourceFile(removed)).toMatchSnapshot();
});

it('add element', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const componentLayer = getComponentLayer(sourceFile);

  const result1 = Element.addChild(
    sourceFile,
    componentLayer!.element.indexPath,
    'Text',
  );

  expect(printSourceFile(result1)).toMatchSnapshot();

  const result2 = Element.addChild(
    result1,
    componentLayer!.element.indexPath,
    'Image',
  );

  expect(printSourceFile(result2)).toMatchSnapshot();
});

it('remove element', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View><Text></Text><Image></Image></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const componentLayer = getComponentLayer(sourceFile);

  const result1 = Element.removeElement(
    sourceFile,
    componentLayer!.element.children[1].indexPath,
  );

  expect(printSourceFile(result1)).toMatchSnapshot();

  const result2 = Element.removeElement(
    result1,
    componentLayer!.element.children[0].indexPath,
  );

  expect(printSourceFile(result2)).toMatchSnapshot();
});

it('visits', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const updated = setFunctionName(sourceFile, 'Bar');

  const printer = ts.createPrinter();

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    updated,
    updated as SourceFile,
  );

  expect(result).toMatchSnapshot();
});
