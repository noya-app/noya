import * as tsvfs from '@typescript/vfs';
import lzstring from 'lz-string';
import ts from 'typescript';
export * from './componentLayer';

export const compilerOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.Preserve,
};

export async function createBaseFileSystem(): Promise<Map<string, string>> {
  return await tsvfs.createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    true,
    ts,
    lzstring,
  );
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
