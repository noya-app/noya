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
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { tailwindColors } from '../ayon/tailwind/tailwind.config';
import { ControlledFrame } from './ControlledFrame';
import {
  SerializedSelection,
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
  getIframe: () => HTMLIFrameElement;
  isRendering: () => boolean;
}

export const DSRenderer = function DSRenderer({
  sourceName,
  primary,
  renderContent,
  serializedSelection,
  setSerializedSelection,
  onBeforeInput,
  onReady,
}: {
  sourceName: string;
  primary: string;
  renderContent: (options: DSRenderProps) => React.ReactNode;
  serializedSelection?: SerializedSelection;
  setSerializedSelection?: (value: SerializedSelection | undefined) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onReady?: () => void;
}) {
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
    root.render(withProvider, { sync: true });

    setDOMSelection(
      iframe.contentWindow!,
      iframe.contentDocument!,
      serializedSelection,
    );

    lock.current = false;
  }, [theme, renderContent, root, system, primary, serializedSelection, ready]);

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
};
