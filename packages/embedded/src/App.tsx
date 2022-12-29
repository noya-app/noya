import { StateProvider } from 'noya-app-state-context';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { setPublicPath } from 'noya-public-path';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { createInitialWorkspaceState, createSketchFile } from 'noya-state';
import { decodeQueryParameters } from 'noya-utils';
import * as React from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { z } from 'zod';
import { ObjectList, objectListSchema } from './ObjectList';
import { PropertyList, propertyListSchema } from './PropertyList';

export const GlobalStyles = createGlobalStyle(({ theme }) => ({
  '*': {
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  },
  html: {
    width: '100%',
    minHeight: '100vh',
  },
  'body, #root': {
    flex: '1',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    background: theme.colors.canvas.background,
  },
}));

export type UrlHashParameters = Record<string, string>;

export function getUrlHashParameters(): UrlHashParameters {
  try {
    return decodeQueryParameters(window.location.hash.slice(1));
  } catch (e) {
    console.warn(e);
    return {};
  }
}

const baseSchema = z
  .object({
    targetOrigin: z.string(),
  })
  .passthrough();

function getUrlData() {
  try {
    const urlParams = getUrlHashParameters();
    if (!urlParams.data) return undefined;
    const data = JSON.parse(urlParams.data);
    return baseSchema.parse(data);
  } catch (e) {
    console.warn(e);
    return undefined;
  }
}

const dataSchema = z.discriminatedUnion('type', [
  objectListSchema,
  propertyListSchema,
]);

function Content() {
  const initialData = useMemo(() => getUrlData(), []);
  const parsed = initialData ? dataSchema.parse(initialData) : undefined;
  const [data, setData] = useState(parsed);

  const sendMessage = (message: any) => {
    if (!initialData) return;
    window.parent.postMessage(message, initialData.targetOrigin);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      setData(dataSchema.parse(event.data));
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!data) {
    return <div style={{ color: 'white' }}>{JSON.stringify(data)}</div>;
  }

  switch (data.type) {
    case 'objectList':
      return (
        <ObjectList
          data={data.data}
          sendMessage={sendMessage}
          selection={data.selection}
        />
      );
    case 'propertyList':
      return <PropertyList data={data.data} sendMessage={sendMessage} />;
  }
}

let initialized = false;

export default function Embedded(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  const workspaceState = useMemo(
    () => createInitialWorkspaceState(createSketchFile()),
    [],
  );

  return (
    <DesignSystemConfigurationProvider theme={darkTheme} platform={'key'}>
      <GlobalStyles />
      <Suspense fallback="Loading">
        <CanvasKitProvider>
          <FontManagerProvider>
            <StateProvider state={workspaceState}>
              <Content />
            </StateProvider>
          </FontManagerProvider>
        </CanvasKitProvider>
      </Suspense>
    </DesignSystemConfigurationProvider>
  );
}
