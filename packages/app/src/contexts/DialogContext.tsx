import { Button, Dialog, IDialog, InputField, Spacer } from 'noya-designsystem';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';

function createDeferredPromise<T>() {
  let resolve: (value: T) => void = () => {};
  let reject: (value: any) => void = () => {};

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

export type DialogContextValue = {
  openInputDialog(
    title: string,
    inputValue?: string,
  ): Promise<string | undefined>;

  containsElement(element: HTMLElement): boolean;
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const DialogProvider = function DialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [contents, setContents] = useState<
    | {
        title: string;
        inputValue: string;
        resolve: (value: string | undefined) => void;
      }
    | undefined
  >();

  const isOpen = !!contents;

  const close = useCallback(() => {
    if (!contents) return;

    contents.resolve(undefined);
  }, [contents]);

  const submit = useCallback(() => {
    if (!contents || !contents.inputValue) return;

    contents.resolve(contents.inputValue);
    setContents(undefined);
  }, [contents]);

  const open: DialogContextValue['openInputDialog'] = useCallback(
    (title, inputValue = '') => {
      const { promise, resolve } = createDeferredPromise<string | undefined>();

      setContents({
        title,
        inputValue,
        resolve: (value) => {
          resolve(value);
          setContents(undefined);
        },
      });

      return promise;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;

      event.stopPropagation();
      event.preventDefault();

      submit();
    },
    [submit],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<IDialog>(null);

  const containsElement = useCallback((element: HTMLElement) => {
    if (!dialogRef.current) return false;

    return dialogRef.current.containsElement(element);
  }, []);

  return (
    <>
      <DialogContext.Provider
        value={useMemo(
          () => ({ openInputDialog: open, containsElement }),
          [containsElement, open],
        )}
      >
        {children}
      </DialogContext.Provider>
      <Dialog
        ref={dialogRef}
        title={contents?.title}
        open={isOpen}
        onOpenChange={useCallback(
          (isOpen) => {
            if (!isOpen) {
              close();
            }
          },
          [close],
        )}
        onOpenAutoFocus={useCallback((event) => {
          event.stopPropagation();
          event.preventDefault();

          inputRef.current?.focus();
        }, [])}
      >
        <InputField.Root>
          <InputField.Input
            ref={inputRef}
            value={contents?.inputValue ?? ''}
            onChange={(value) => {
              setContents((contents) =>
                contents
                  ? {
                      ...contents,
                      inputValue: value,
                    }
                  : undefined,
              );
            }}
            onKeyDown={handleKeyDown}
          />
        </InputField.Root>
        <Spacer.Vertical size={20} />
        <InspectorPrimitives.Row>
          <Spacer.Horizontal />
          <Button onClick={close}>Cancel</Button>
          <Spacer.Horizontal size={20} />
          <Button disabled={!contents?.inputValue} onClick={submit}>
            Submit
          </Button>
        </InspectorPrimitives.Row>
      </Dialog>
    </>
  );
};

function useDialog(): DialogContextValue {
  const value = useContext(DialogContext);

  if (!value) {
    throw new Error('Missing DialogProvider');
  }

  return value;
}

export function useOpenInputDialog() {
  return useDialog().openInputDialog;
}

export function useDialogContainsElement() {
  return useDialog().containsElement;
}
