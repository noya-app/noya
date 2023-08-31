import {
  DesignSystemDefinition,
  ProviderProps,
  RenderableRoot,
  Theme,
  component,
  transform,
} from '@noya-design-system/protocol';
import { Stack } from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import { useStableCallback } from 'noya-react-utils';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { tailwindColors } from '../ayon/tailwind/tailwind.config';
import { ControlledFrame } from './ControlledFrame';
import {
  ProxyEvent,
  ProxyEventHandler,
  SerializedSelection,
  createSelectionHandlers,
  serializeSelection,
  setDOMSelection,
} from './dom';

const Loading = styled.div({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '4px 8px',
  color: '#aaa',
  pointerEvents: 'none',
});

export type DSRenderProps = {
  system: DesignSystemDefinition;
  theme: any;
  primary: string;
  iframe: HTMLIFrameElement;
};

export type DSRenderContext = {
  iframe: HTMLIFrameElement;
};

export interface IDSRenderer {
  mouseDown: ProxyEventHandler;
  mouseMove: ProxyEventHandler;
  mouseUp: ProxyEventHandler;
}

type Props = {
  sourceName: string;
  primary: string;
  renderContent: (options: DSRenderProps) => React.ReactNode;
  serializedSelection?: SerializedSelection;
  setSerializedSelection?: (value: SerializedSelection | undefined) => void;
  setHighlightedPath?: (path: string[] | undefined) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onReady?: () => void;
  sync?: boolean;
};

export const DSRenderer = forwardRef(function DSRenderer(
  {
    sourceName,
    primary,
    renderContent,
    serializedSelection,
    setSerializedSelection,
    setHighlightedPath,
    onBeforeInput,
    onReady,
    sync = true,
  }: Props,
  forwardedRef: React.ForwardedRef<IDSRenderer>,
) {
  const [ready, setReady] = React.useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  const [root, setRoot] = React.useState<RenderableRoot | undefined>();
  const [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();

  const handleReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (!ready) return;

    async function fetchLibrary() {
      const system = await loadDesignSystem(sourceName, {
        Function: ref.current!.contentWindow!['Function' as any] as any,
        enableCache: false,
      });

      setSystem(system);
    }

    setSystem(undefined);
    fetchLibrary();
  }, [ready, sourceName]);

  useEffect(() => {
    if (!system) {
      if (root) {
        root.unmount();
        setRoot(undefined);
      }

      return;
    }

    if (!root) {
      setRoot(system.createRoot(ref.current!.contentDocument!.body));
    }
  }, [root, system]);

  const theme = useMemo(() => {
    if (!system || !system.themeTransformer) return undefined;

    const t: Theme = {
      colors: {
        primary: (tailwindColors as any)[primary as any],
        neutral: tailwindColors.slate,
      },
    };

    const themeValue = transform({ theme: t }, system.themeTransformer);

    return themeValue;
  }, [primary, system]);

  const lock = useRef(false);

  useLayoutEffect(() => {
    const iframe = ref.current;

    if (!root || !system || !iframe || !ready) return;

    const Provider: React.FC<ProviderProps> =
      system.components[component.id.Provider];

    const content = renderContent({
      system,
      theme,
      primary,
      iframe,
    });

    const withProvider = Provider ? (
      <Provider theme={theme}>{content}</Provider>
    ) : (
      content
    );

    lock.current = true;

    // Render sync since we update the selection right after
    root.render(withProvider, { sync });

    setDOMSelection(
      iframe.contentWindow!,
      iframe.contentDocument!,
      serializedSelection,
    );

    lock.current = false;
  }, [
    theme,
    renderContent,
    root,
    system,
    primary,
    serializedSelection,
    ready,
    sync,
  ]);

  useEffect(() => {
    if (!ready || !ref.current) return;

    const document = ref.current.contentDocument;
    const window = ref.current.contentWindow;

    if (!document || !window) return;

    const handleSelectionChange = () => {
      if (lock.current) return;

      setSerializedSelection?.(serializeSelection(window, document));
    };

    const handleBeforeInput = (event: InputEvent) => {
      onBeforeInput?.(event);
    };

    window.addEventListener('beforeinput', handleBeforeInput);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      window.removeEventListener('beforeinput', handleBeforeInput);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [ready, setSerializedSelection, onBeforeInput]);

  // Add indirection so we don't recreate the handlers (which have an internal timer)
  const _setSerializedSelection = useStableCallback(setSerializedSelection);
  const _setHighlightedPath = useStableCallback(setHighlightedPath);

  const eventHandlers = useMemo(
    () =>
      ready && ref.current && ref.current.contentDocument
        ? createSelectionHandlers(
            ref.current.contentDocument,
            _setSerializedSelection,
            _setHighlightedPath,
          )
        : undefined,
    [_setHighlightedPath, _setSerializedSelection, ready],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      mouseDown: (event: ProxyEvent) => eventHandlers?.onMouseDown(event),
      mouseMove: (event: ProxyEvent) => eventHandlers?.onMouseMove(event),
      mouseUp: (event: ProxyEvent) => eventHandlers?.onMouseUp(event),
    }),
    [eventHandlers],
  );

  return (
    <Stack.V flex="1" position="relative">
      <ControlledFrame
        ref={ref}
        title="Design System Preview"
        onReady={handleReady}
      />
      {!system && <Loading>Loading design system...</Loading>}
    </Stack.V>
  );
});
