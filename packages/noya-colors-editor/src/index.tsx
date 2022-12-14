import { NoyaSession } from 'noya-backend-client';
import {
  Button,
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { createNoyaObject, serializeTree } from 'noya-object-utils';
import { SketchModel } from 'noya-sketch-model';
import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { z } from 'zod';
import { ColorsGrid } from './components/ColorsGrid';
import {
  AppData,
  appDataSchema,
  ColorSwatch,
  documentSchema,
  userDataSchema,
} from './schema';

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

      const parsedUserData = z.string().safeParse(root.get('userDataNodeId'));

      if (!parsedUserData.success) {
        const child = createNoyaObject(root, userDataSchema.parse(undefined));
        root.set('userDataNodeId', child.id);
        return;
      }

      const documentNodeId = z.string().safeParse(root.get('documentNodeId'));

      if (!documentNodeId.success) {
        const child = createNoyaObject(root, documentSchema.parse(undefined));
        root.set('documentNodeId', child.id);
        return;
      }

      const serialized = serializeTree(root);

      const appData = appDataSchema.parse(serialized);

      // console.log(serialized, appData);

      setAppData(appData);
    });
  }, []);

  // console.log(appData);

  if (!appData) return <>Loading...</>;

  const { documentNodeId, userDataNodeId, children } = appData;

  const documentNode = documentSchema.parse(
    children.find((child) => child.id === documentNodeId),
  );

  const userDataNode = userDataSchema.parse(
    children.find((child) => child.id === userDataNodeId),
  );

  // console.log(documentNode, userDataNode);

  const sketchSwatches = documentNode.children.map((swatch): Sketch.Swatch => {
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
              const object = channel.objects[documentNode.id];

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
            selectedSwatchIds={userDataNode.selectedIds}
            onSelectSwatch={(id) => {
              const object = channel.objects[userDataNode.id];

              if (!object) return;

              object.set('selectedIds', [id]);
            }}
          />
        </Container>
      </DesignSystemConfigurationProvider>
    </Suspense>
  );
}
