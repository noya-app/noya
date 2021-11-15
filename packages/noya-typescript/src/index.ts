import ts from 'typescript';
import * as tsvfs from '@typescript/vfs';
import lzstring from 'lz-string';

const compilerOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.Preserve,
};

function getComponentFunctionDeclaration(sourceFile: ts.SourceFile) {
  const functionDeclaration = ts.forEachChild(sourceFile, (child) => {
    if (child.kind === ts.SyntaxKind.FunctionDeclaration) {
      return child;
    }
  }) as ts.FunctionDeclaration | undefined;

  // console.log(functionDeclaration?.name);

  return functionDeclaration;
}

export async function testTypescript() {
  const fsMap = await tsvfs.createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    true,
    ts,
    lzstring,
  );

  fsMap.set(
    'index.tsx',
    `function Test() {
  return <View></View>;
}`,
  );
  // fsMap.set('index.ts', '// main TypeScript file content');

  // console.log([...fsMap.keys()]);

  const system = tsvfs.createSystem(fsMap);
  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

  const program = ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost,
  });

  // This will update the fsMap with new files
  // for the .d.ts and .js files
  program.emit();

  // Now I can look at the AST for the .ts file too
  const index = program.getSourceFile('index.tsx');

  if (index) {
    console.info(index, getComponentFunctionDeclaration(index));
  }

  // console.log([...fsMap.keys()]);
}
