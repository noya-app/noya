import {
  createBaseFileSystem,
  createTypescriptEnvironment,
  getComponentLayer,
  setAttributeStringValue,
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

function printSourceFile(sourceFile: SourceFile) {
  const printer = ts.createPrinter();

  return printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile);
}

it('gets component layer', () => {
  env.environment.createFile(
    filename,
    `export default function Foo() {
    return <View></View>
  }`,
  );

  const sourceFile = env.environment.getSourceFile(filename)!;

  const componentLayer = getComponentLayer(sourceFile, 'abc');

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

  const componentLayer = getComponentLayer(sourceFile, 'abc');

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

  const componentLayer = getComponentLayer(sourceFile, 'abc');
  const attribute = componentLayer!.element.attributes['name'];

  if (attribute.type !== 'stringLiteral') throw new Error('Bad attribute');

  const result = setAttributeStringValue(
    sourceFile,
    attribute.indexPath,
    'hello',
  );

  expect(printSourceFile(result)).toMatchSnapshot();
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
