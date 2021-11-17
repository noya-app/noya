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
  function TypescriptCompilerProvider({
    environment: initialEnvironment,
    children,
  }: {
    environment?: TypescriptEnvironment;
    children: ReactNode;
  }) {
    const successEnvironment = useMemo(():
      | PromiseState<TypescriptEnvironment>
      | undefined => {
      return initialEnvironment
        ? { type: 'success', value: initialEnvironment }
        : undefined;
    }, [initialEnvironment]);

    // const [baseFileSystem, setBaseFileSystem] = useState<
    //   PromisedFileSystem
    // >(initialFileSystem ?? { type: 'pending' });

    const [environment, setEnvironment] = useState<
      PromiseState<TypescriptEnvironment>
    >(successEnvironment ?? { type: 'pending' });

    useEffect(() => {
      // environment was passed in, no need to fetch
      if (initialEnvironment) return;

      createBaseFileSystem()
        .then((fileSystem) => {
          setEnvironment({
            type: 'success',
            value: createTypescriptEnvironment(fileSystem),
          });
        })
        .catch((error) => {
          setEnvironment({ type: 'failure', value: error });
        });
    }, [initialEnvironment]);

    const compileFile = useCallback(
      (id: string, source: string) => {
        if (environment.type !== 'success') return;

        const filename = `${id}.tsx`;

        if (environment?.value.environment.getSourceFile(filename)) {
          environment?.value.environment.updateFile(filename, source);
        } else {
          environment?.value.environment.createFile(filename, source);
        }

        return environment?.value.environment.getSourceFile(filename);
      },
      [environment],
    );

    const contextValue = useMemo(() => {
      if (environment.type !== 'success') return;

      return { compileFile, environment: environment.value };
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
