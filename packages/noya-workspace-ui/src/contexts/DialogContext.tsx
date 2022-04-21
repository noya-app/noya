import React, {
  useRef,
  useMemo,
  useState,
  ReactNode,
  useContext,
  useCallback,
  createContext,
} from 'react';

import {
  Layout,
  Button,
  Dialog,
  IDialog,
  InputField,
  KeyDownParams,
} from 'noya-designsystem';
import { Primitives } from '../primitives';

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
    (event: KeyDownParams) => {
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
        <InputField.Root flex="">
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
        <Layout.Stack size={20} />
        <Primitives.Row>
          <Layout.Queue />
          <Button onClick={close}>Cancel</Button>
          <Layout.Queue size={20} />
          <Button disabled={!contents?.inputValue} onClick={submit}>
            Submit
          </Button>
        </Primitives.Row>
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
