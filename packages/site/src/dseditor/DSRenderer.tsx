import {
  DesignSystemDefinition,
  ProviderProps,
  RenderableRoot,
  Theme,
  component,
  transform,
} from '@noya-design-system/protocol';
import { DSConfig } from 'noya-api';
import { Stack } from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import { useStableCallback } from 'noya-react-utils';
import { tailwindColors } from 'noya-tailwind';
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
import { ControlledFrame } from './ControlledFrame';
import {
  ProxyMouseEvent,
  ProxyMouseEventHandler,
  ProxyWheelEvent,
  ProxyWheelEventHandler,
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
  mouseDown: ProxyMouseEventHandler;
  mouseMove: ProxyMouseEventHandler;
  mouseUp: ProxyMouseEventHandler;
  mouseWheel: ProxyWheelEventHandler;
}

type Props = {
  sourceName: string;
  config: DSConfig;
  renderContent: (options: DSRenderProps) => React.ReactNode;
  serializedSelection?: SerializedSelection;
  setSerializedSelection?: (value: SerializedSelection | undefined) => void;
  setHighlightedPath?: (path: string[] | undefined) => void;
  setSelectedPath?: (path: string[] | undefined) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onReady?: () => void;
  sync?: boolean;
};

export const DSRenderer = forwardRef(function DSRenderer(
  {
    sourceName,
    config,
    renderContent,
    serializedSelection,
    setSerializedSelection,
    setHighlightedPath,
    setSelectedPath,
    onBeforeInput,
    onReady,
    sync = true,
  }: Props,
  forwardedRef: React.ForwardedRef<IDSRenderer>,
) {
  const [ready, setReady] = React.useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  const [root, setRoot] = React.useState<RenderableRoot | undefined>();
  let [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();

  const handleReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    let mounted = true;

    if (!ready) return;

    async function fetchLibrary() {
      const system = await loadDesignSystem(sourceName, {
        Function: ref.current!.contentWindow!['Function' as any] as any,
        enableCache: false,
      });

      if (!mounted) return;

      setSystem(system);
    }

    setSystem(undefined);
    fetchLibrary();

    return () => {
      mounted = false;
    };
  }, [ready, sourceName]);

  useEffect(() => {
    if (!system) {
      if (root) {
        root.unmount();
        setRoot(undefined);
      }

      return;
    }

    if (!root && ready) {
      setRoot(
        system.createRoot(
          ref.current!.contentDocument!.getElementById('noya-preview-root')!,
        ),
      );
    }
  }, [ready, root, system]);

  const theme = useMemo(() => {
    if (!system || !system.themeTransformer) return undefined;

    const t: Theme = {
      colorMode: config.colorMode ?? 'light',
      colors: {
        primary: (tailwindColors as any)[config.colors.primary ?? 'blue'],
        neutral: tailwindColors.slate,
      },
    };

    const themeValue = transform({ theme: t }, system.themeTransformer);

    return themeValue;
  }, [config.colorMode, config.colors.primary, system]);

  const lock = useRef(false);

  useLayoutEffect(() => {
    const iframe = ref.current;

    if (!root || !system || !iframe || !ready) return;

    const Provider: React.FC<ProviderProps> =
      system.components[component.id.Provider];

    const content = renderContent({
      system,
      theme,
      primary: config.colors.primary,
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
    serializedSelection,
    ready,
    sync,
    config.colors.primary,
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
  const _setSelectedPath = useStableCallback(setSelectedPath);

  const eventHandlers = useMemo(
    () =>
      ready && ref.current && ref.current.contentDocument
        ? createSelectionHandlers(
            ref.current.contentDocument,
            _setSerializedSelection,
            _setHighlightedPath,
            _setSelectedPath,
          )
        : undefined,
    [_setHighlightedPath, _setSelectedPath, _setSerializedSelection, ready],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      mouseDown: (event: ProxyMouseEvent) => eventHandlers?.onMouseDown(event),
      mouseMove: (event: ProxyMouseEvent) => eventHandlers?.onMouseMove(event),
      mouseUp: (event: ProxyMouseEvent) => eventHandlers?.onMouseUp(event),
      mouseWheel: (event: ProxyWheelEvent) =>
        eventHandlers?.onMouseWheel(event),
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
