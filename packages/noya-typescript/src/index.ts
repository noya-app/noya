import * as tsvfs from '@typescript/vfs';
import lzstring from 'lz-string';
import ts, { SourceFile } from 'typescript';
export * from './componentLayer';
export * from './TypescriptCompilerContext';
export { Nodes } from './traversal';

export const compilerOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.Preserve,
};

export async function createBaseFileSystem(
  fetcher?: Parameters<typeof tsvfs.createDefaultMapFromCDN>[5],
): Promise<Map<string, string>> {
  return await tsvfs.createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    true,
    ts,
    lzstring,
    fetcher,
  );
}

export async function createTestingFileSystem(): Promise<Map<string, string>> {
  return await tsvfs.createDefaultMapFromNodeModules(compilerOptions, ts);
}

export type TypescriptEnvironment = {
  environment: tsvfs.VirtualTypeScriptEnvironment;
  fileSystem: Map<string, string>;
};

export function createTypescriptEnvironment(
  baseFileSystem: Map<string, string>,
): TypescriptEnvironment {
  const fileSystem = new Map(baseFileSystem);

  const system = tsvfs.createSystem(fileSystem);

  const env = tsvfs.createVirtualTypeScriptEnvironment(
    system,
    [],
    ts,
    compilerOptions,
  );

  return {
    environment: env,
    fileSystem,
    // host: tsvfs.createVirtualCompilerHost(system, compilerOptions, ts),
  };
}

export function printSourceFile(sourceFile: SourceFile, node?: ts.Node) {
  const printer = ts.createPrinter();

  return printer.printNode(
    ts.EmitHint.Unspecified,
    node ?? sourceFile,
    sourceFile,
  );
}
