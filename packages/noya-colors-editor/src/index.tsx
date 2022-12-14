import { NoyaSession } from 'noya-backend-client';
import {
  Button,
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { createLinkedNode, createNoyaObject } from 'noya-object-utils';
import { SketchModel } from 'noya-sketch-model';
import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ColorsGrid } from './components/ColorsGrid';
import { AppData, ColorSwatch, documentSchema, userDataSchema } from './schema';

const session = new NoyaSession('Sam');
const channel = session.join('test');

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
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
}));

export default function NoyaJsonEditor(): JSX.Element {
  const [appData, setAppData] = useState<AppData | undefined>(undefined);

  useEffect(() => {
    return channel.addListener((event) => {
      const root = channel.root;

      if (!root) return;

      const userData = createLinkedNode(root, 'userDataNodeId', userDataSchema);
      const document = createLinkedNode(root, 'documentNodeId', documentSchema);

      if (!userData || !document) return;

      setAppData({ userData, document });
    });
  }, []);

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

  return (
    <Suspense fallback="Loading">
      <DesignSystemConfigurationProvider theme={darkTheme} platform={'key'}>
        <GlobalStyles />
        <Container>
          <div>Hello, world!</div>
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
              const object = channel.objects[userData.id];

              if (!object) return;

              object.set('selectedIds', [id]);
            }}
          />
        </Container>
      </DesignSystemConfigurationProvider>
    </Suspense>
  );
}
