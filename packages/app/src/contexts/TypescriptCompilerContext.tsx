import { PromiseState } from 'noya-react-utils';
import {
  createBaseFileSystem,
  createTypescriptEnvironment,
  TypescriptEnvironment,
} from 'noya-typescript';
import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type TypescriptCompilerContextValue = {
  compileFile: (id: string, source: string) => any;
  environment: TypescriptEnvironment;
};

const TypescriptCompilerContext = createContext<
  TypescriptCompilerContextValue | undefined
>(undefined);

export const TypescriptCompilerProvider = memo(
  function TypescriptCompilerProvider({ children }: { children: ReactNode }) {
    const [baseFileSystem, setBaseFileSystem] = useState<
      PromiseState<Map<string, string>>
    >({ type: 'pending' });

    const [environment, setEnvironment] = useState<
      TypescriptEnvironment | undefined
    >();

    useEffect(() => {
      createBaseFileSystem()
        .then((fileSystem) => {
          setBaseFileSystem({ type: 'success', value: fileSystem });
        })
        .catch((error) => {
          setBaseFileSystem({ type: 'failure', value: error });
        });
    }, []);

    useEffect(() => {
      if (baseFileSystem.type !== 'success') return;

      setEnvironment(createTypescriptEnvironment(baseFileSystem.value));
    }, [baseFileSystem]);

    const compileFile = useCallback(
      (id: string, source: string) => {
        const filename = `${id}.tsx`;

        if (environment?.environment.getSourceFile(filename)) {
          environment.environment.updateFile(filename, source);
        } else {
          environment?.environment.createFile(filename, source);
        }

        return environment?.environment.getSourceFile(filename);
      },
      [environment],
    );

    const contextValue = useMemo(() => {
      if (!environment) return;

      return { compileFile, environment };
    }, [compileFile, environment]);

    if (!contextValue) return <></>;

    return (
      <TypescriptCompilerContext.Provider value={contextValue}>
        {children}
      </TypescriptCompilerContext.Provider>
    );
  },
);

export function useTypescriptCompiler(): TypescriptCompilerContextValue {
  const value = useContext(TypescriptCompilerContext);

  if (!value) {
    throw new Error('Missing TypescriptCompilerContext');
  }

  return value;
}
