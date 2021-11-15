import * as tsvfs from '@typescript/vfs';
import { compilerOptions, createBaseFileSystem } from 'noya-typescript';
import ts from 'typescript';

let baseMap: Map<string, string>;

async function setup() {
  if (baseMap === undefined) {
    baseMap = await createBaseFileSystem();
  }
}

export async function compileTypescriptFile(
  source: string,
): Promise<ts.SourceFile> {
  await setup();

  const fsMap = new Map(baseMap);

  fsMap.set('index.tsx', source);

  const system = tsvfs.createSystem(fsMap);

  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

  const program = ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost,
  });

  // program.emit();

  // Now I can look at the AST for the .ts file too
  const index = program.getSourceFile('index.tsx')!;

  return index;
}

// export async function testTypescript() {
//   await setup();

//   const fsMap = new Map(baseMap);

//   fsMap.set(
//     'index.tsx',
//     `function Test() {
//   return <View><Text></Text></View>;
// }`,
//   );
//   // fsMap.set('index.ts', '// main TypeScript file content');

//   // console.log([...fsMap.keys()]);

//   const system = tsvfs.createSystem(fsMap);
//   const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

//   const program = ts.createProgram({
//     rootNames: [...fsMap.keys()],
//     options: compilerOptions,
//     host: host.compilerHost,
//   });

//   // This will update the fsMap with new files
//   // for the .d.ts and .js files
//   program.emit();

//   // Now I can look at the AST for the .ts file too
//   const index = program.getSourceFile('index.tsx');

//   if (index) {
//     const functionDeclaration = firstChildOfKind(
//       index,
//       ts.SyntaxKind.FunctionDeclaration,
//     );

//     // console.log({ functionDeclaration });

//     if (functionDeclaration) {
//       const returnStatement = firstChildOfKind(
//         functionDeclaration,
//         ts.SyntaxKind.ReturnStatement,
//       );

//       if (returnStatement) {
//         const tagName = getLayerHierarchy(returnStatement.expression!);

//         console.info(tagName);
//       }
//     }
//   }

//   // console.log([...fsMap.keys()]);
// }
