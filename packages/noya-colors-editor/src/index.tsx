import { StateProvider } from 'noya-app-state-context';
import { NoyaChannel, NoyaObject } from 'noya-backend-client';
import {
  Button,
  darkTheme,
  DesignSystemConfigurationProvider,
  Divider,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { MultiplayerProvider, useMultiplayer } from 'noya-multiplayer';
import { createLinkedNode, createNoyaObject } from 'noya-object-utils';
import { setPublicPath } from 'noya-public-path';
import { useLazyValue } from 'noya-react-utils';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import {
  createInitialWorkspaceState,
  createSketchFile,
  getMultiValue,
} from 'noya-state';
import { delimitedPath, isDeepEqual } from 'noya-utils';
import * as React from 'react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ColorsGrid } from './components/ColorsGrid';
import ColorInspector from './components/inspector/ColorInspector';
import NameInspector from './components/inspector/NameInspector';
import {
  AppData,
  Color,
  ColorSwatch,
  documentSchema,
  UserData,
  userDataSchema,
  userStoreSchema,
} from './schema';

function getAppData(channel: NoyaChannel): AppData | undefined {
  const root = channel.root;

  if (!root) return;

  const userStore = createLinkedNode(root, 'userStoreNodeId', userStoreSchema);
  const document = createLinkedNode(root, 'documentNodeId', documentSchema);

  if (!userStore || !document) return;

  return { userStore, document };
}

export const GlobalStyles = createGlobalStyle({
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
  },
});

const Container = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.colors.sidebar.background,
}));

const Stack = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
}));

function EditorContent({
  appData,
  userId,
  getObject,
}: {
  appData: AppData;
  userId: string;
  getObject: (id: string) => NoyaObject | undefined;
}) {
  const { document, userStore } = appData;

  const userData = userDataSchema.parse(userStore.userDataMap[userId]);

  const sketchSwatches = document.children.map((swatch): Sketch.Swatch => {
    return {
      _class: 'swatch',
      do_objectID: swatch.id,
      name: swatch.name,
      value: {
        _class: 'color',
        red: swatch.color.red,
        green: swatch.color.green,
        blue: swatch.color.blue,
        alpha: swatch.color.alpha,
        colorSpaces: swatch.color.colorSpaces,
      },
    };
  });

  const selectedSwatches = sketchSwatches.filter((swatch) =>
    userData.selectedIds.includes(swatch.do_objectID),
  );

  const color = getMultiValue(
    selectedSwatches.map((swatch) => swatch.value),
    isDeepEqual,
  );

  const now = Date.now();

  const activeUsers = Object.entries(userStore.userDataMap)
    .filter(([id]) => id !== userId)
    .filter(([, value]) => {
      return now - value.timestamp < 10000;
    });

  const setUserData = (selectedIds: string[]) => {
    const object = getObject(userStore.id);

    if (!object) return;

    const userData: UserData = { selectedIds, timestamp: Date.now() };

    object.set(userId, userData);
  };

  return (
    <Container>
      <Stack>
        <Button
          onClick={() => {
            const object = getObject(document.id);

            if (!object) return;

            createNoyaObject<ColorSwatch>(object, {
              name: 'New Color',
              color: { alpha: 1, red: 1, green: 0, blue: 0 },
            });
          }}
        >
          Add Color
        </Button>
        <ColorsGrid
          swatches={sketchSwatches}
          selectedSwatchIds={userData.selectedIds}
          presence={activeUsers}
          onSelectSwatch={(id) => setUserData(id ? [id] : [])}
        />
      </Stack>
      <div style={{ width: '1px', background: 'black' }} />
      <Stack style={{ flex: '0 0 280px' }}>
        {selectedSwatches.length > 0 && (
          <>
            <NameInspector
              names={selectedSwatches.map((v) =>
                delimitedPath.basename(v.name),
              )}
              onNameChange={(name) => {
                // console.log('on change name', name);

                selectedSwatches.forEach((swatch) => {
                  const object = getObject(swatch.do_objectID);

                  if (!object) return;

                  object.set('name', name);
                });
              }}
            />
            <Divider />
            <ColorInspector
              key={selectedSwatches[0].do_objectID}
              id={`color-swatch-${selectedSwatches[0].do_objectID}]}`}
              color={color}
              onSetOpacity={(value) => {
                selectedSwatches.forEach((swatch) => {
                  const object = getObject(swatch.do_objectID);

                  if (!object) return;

                  const noyaColor: Color = {
                    alpha: value,
                    red: swatch.value.red,
                    green: swatch.value.green,
                    blue: swatch.value.blue,
                    colorSpaces: swatch.value.colorSpaces,
                  };

                  object.set('color', noyaColor);
                });

                setUserData(userData.selectedIds);
              }}
              onChangeColor={(color) => {
                selectedSwatches.forEach((swatch) => {
                  const object = getObject(swatch.do_objectID);

                  if (!object) return;

                  const noyaColor: Color = {
                    alpha: color.alpha,
                    red: color.red,
                    green: color.green,
                    blue: color.blue,
                    colorSpaces: color.colorSpaces,
                  };

                  object.set('color', noyaColor);
                });

                setUserData(userData.selectedIds);
              }}
            />
          </>
        )}
      </Stack>
    </Container>
  );
}

export function NoyaColorsEditor() {
  const { session } = useMultiplayer();

  const channel = useLazyValue(() => session.join('colors'));

  const getObject = useCallback(
    (id: string): NoyaObject | undefined => channel.objects[id],
    [channel],
  );

  const [appData, setAppData] = useState<AppData | undefined>(() =>
    getAppData(channel),
  );

  useEffect(() => {
    return channel.addListener(() => {
      const appData = getAppData(channel);
      if (!appData) return;
      setAppData(appData);
    });
  }, [channel]);

  if (!appData || !session.userId) return <>Loading...</>;

  return (
    <EditorContent
      appData={appData}
      userId={session.userId}
      getObject={getObject}
    />
  );
}

let initialized = false;

export default function NoyaColorsEditorStandalone(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  const workspaceState = useMemo(
    () => createInitialWorkspaceState(createSketchFile()),
    [],
  );

  return (
    <Suspense fallback="Loading">
      <MultiplayerProvider>
        <CanvasKitProvider>
          <FontManagerProvider>
            <StateProvider state={workspaceState}>
              <DesignSystemConfigurationProvider
                theme={darkTheme}
                platform={'key'}
              >
                <GlobalStyles />
                <NoyaColorsEditor />
              </DesignSystemConfigurationProvider>
            </StateProvider>
          </FontManagerProvider>
        </CanvasKitProvider>
      </MultiplayerProvider>
    </Suspense>
  );
}
