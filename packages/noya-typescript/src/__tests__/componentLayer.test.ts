import {
  createBaseFileSystem,
  createTypescriptEnvironment,
  getComponentLayer,
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

  const componentLayer = getComponentLayer(sourceFile, 'abc');

  expect(componentLayer).toMatchSnapshot();
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
