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
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { tailwindColors } from '../ayon/tailwind/tailwind.config';

const Loading = styled.div({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '4px 8px',
  color: '#aaa',
  pointerEvents: 'none',
});

const Frame = styled.iframe({
  width: '100%',
  height: '100%',
});

export type DSRenderProps = {
  system: DesignSystemDefinition;
  theme: any;
};

export function DSRenderer({
  sourceName,
  primary,
  renderContent,
}: {
  sourceName: string;
  primary: string;
  renderContent: (options: DSRenderProps) => React.ReactNode;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [root, setRoot] = React.useState<RenderableRoot | undefined>();
  const [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(sourceName, {
        Function: ref.current!.contentWindow!['Function' as any] as any,
        enableCache: false,
      });

      setSystem(system);
    }

    setSystem(undefined);
    fetchLibrary();
  }, [sourceName]);

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

  useLayoutEffect(() => {
    if (!root || !system) return;

    const Provider: React.FC<ProviderProps> =
      system.components[component.id.Provider];

    const content = renderContent({ system, theme: theme });

    const withProvider = Provider ? (
      <Provider theme={theme}>{content}</Provider>
    ) : (
      content
    );

    root.render(withProvider);
  }, [theme, renderContent, root, system]);

  return (
    <Stack.V flex="1" position="relative">
      {/* Ensure html5 doctype for proper styling */}
      <Frame ref={ref} title="Design System Preview" srcDoc="<!DOCTYPE html>" />
      {!system && <Loading>Loading design system...</Loading>}
    </Stack.V>
  );
}
