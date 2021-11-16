import {
  createBaseFileSystem,
  createTypescriptEnvironment,
  getComponentLayer,
  TypescriptEnvironment,
} from 'noya-typescript';

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
