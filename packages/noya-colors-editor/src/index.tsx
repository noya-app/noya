import { StateProvider } from 'noya-app-state-context';
import { NoyaSession } from 'noya-backend-client';
import {
  Button,
  darkTheme,
  DesignSystemConfigurationProvider,
  Divider,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { createLinkedNode, createNoyaObject } from 'noya-object-utils';
import { setPublicPath } from 'noya-public-path';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import {
  createInitialWorkspaceState,
  createSketchFile,
  getMultiValue,
} from 'noya-state';
import { delimitedPath, isDeepEqual } from 'noya-utils';
import * as React from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ColorsGrid } from './components/ColorsGrid';
import ColorInspector from './components/inspector/ColorInspector';
import NameInspector from './components/inspector/NameInspector';
import {
  AppData,
  Color,
  ColorSwatch,
  documentSchema,
  userDataSchema,
} from './schema';

const session = new NoyaSession('Sam');
const channel = session.join('test');

function getAppData() {
  const root = channel.root;

  if (!root) return;

  const userData = createLinkedNode(root, 'userDataNodeId', userDataSchema);
  const document = createLinkedNode(root, 'documentNodeId', documentSchema);

  if (!userData || !document) return;

  return { userData, document };
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

export function NoyaColorsEditor() {
  const [appData, setAppData] = useState<AppData | undefined>(() =>
    getAppData(),
  );

  useEffect(() => {
    return channel.addListener(() => {
      const appData = getAppData();
      if (!appData) return;
      setAppData(appData);
    });
  }, []);

  // console.log(appData);

  if (!appData) return <>Loading...</>;

  const { document, userData } = appData;

  const sketchSwatches = document.children.map((swatch): Sketch.Swatch => {
    return {
      _class: 'swatch',
      do_objectID: swatch.id,
      name: swatch.name,
      value: SketchModel.color({
        red: swatch.color.red,
        green: swatch.color.green,
        blue: swatch.color.blue,
        alpha: swatch.color.alpha,
      }),
    };
  });

  const selectedSwatches = sketchSwatches.filter((swatch) =>
    userData.selectedIds.includes(swatch.do_objectID),
  );

  const color = getMultiValue(
    selectedSwatches.map((swatch) => swatch.value),
    isDeepEqual,
  );

  return (
    <Container>
      <Stack>
        <Button
          onClick={() => {
            const object = channel.objects[document.id];

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
          onSelectSwatch={(id) => {
            // console.log('select', id);

            const object = channel.objects[userData.id];

            if (!object) return;

            object.set('selectedIds', [id]);
          }}
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
                  const object = channel.objects[swatch.do_objectID];

                  if (!object) return;

                  object.set('name', name);
                });
              }}
            />
            <Divider />
            <ColorInspector
              id={'color-swatch'}
              color={color}
              // onSetOpacity={(value) => {
              //   selectedSwatches.forEach((swatch) => {
              //     const object = channel.objects[swatch.do_objectID];

              //     if (!object) return;

              //     const noyaColor: Color = {
              //       alpha: value,
              //       red: swatch.value.red,
              //       green: swatch.value.green,
              //       blue: swatch.value.blue,
              //     };

              //     object.set('color', noyaColor);
              //   });
              // }}
              onChangeColor={(color) => {
                // console.log('on change color', color);

                selectedSwatches.forEach((swatch) => {
                  const object = channel.objects[swatch.do_objectID];

                  if (!object) return;

                  const noyaColor: Color = {
                    alpha: color.alpha,
                    red: color.red,
                    green: color.green,
                    blue: color.blue,
                  };

                  object.set('color', noyaColor);
                });
              }}
            />
          </>
        )}
      </Stack>
    </Container>
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
    </Suspense>
  );
}
