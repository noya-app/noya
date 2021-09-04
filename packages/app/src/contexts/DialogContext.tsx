import { Button, Dialog, InputField, Spacer } from 'noya-designsystem';
import {
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
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const DialogProvider = function DialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [contents, setContents] = useState<
    { title: string; inputValue?: string } | undefined
  >();

  const isOpen = !!contents;

  const {
    close,
    open,
  }: {
    close: (value: string | undefined) => void;
    open: DialogContextValue['openInputDialog'];
  } = useMemo(() => {
    const { promise, resolve } = createDeferredPromise<string | undefined>();

    return {
      close: (value: string | undefined) => {
        setContents(undefined);

        resolve(value);
      },
      open: (title, inputValue) => {
        setContents({
          title: title,
          inputValue,
        });

        return promise;
      },
    };
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter' || !contents?.inputValue) return;

      event.stopPropagation();
      event.preventDefault();

      close(contents?.inputValue);
    },
    [close, contents?.inputValue],
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <DialogContext.Provider
        value={useMemo(() => ({ openInputDialog: open }), [open])}
      >
        {children}
      </DialogContext.Provider>
      <Dialog
        title={contents?.title}
        open={isOpen}
        onOpenChange={useCallback(
          (isOpen) => {
            if (!isOpen) {
              close(undefined);
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
                      title: contents.title,
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
          <Button
            onClick={useCallback(() => {
              close(undefined);
            }, [close])}
          >
            Cancel
          </Button>
          <Spacer.Horizontal size={20} />
          <Button
            disabled={!contents?.inputValue}
            onClick={useCallback(() => {
              close(contents?.inputValue);
            }, [close, contents?.inputValue])}
          >
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
