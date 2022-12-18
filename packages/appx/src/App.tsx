import { StateProvider } from 'noya-app-state-context';
import { ColorsEditorContent, getColorsAppData } from 'noya-colors-editor';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { MultiplayerProvider, useMultiplayer } from 'noya-multiplayer';
import {
  createLinkedNode,
  createNoyaObject,
  serializeTree,
} from 'noya-object-utils';
import { PipelineProvider } from 'noya-pipeline';
import { useLazyValue } from 'noya-react-utils';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { createInitialWorkspaceState, createSketchFile } from 'noya-state';
import * as React from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Inspector } from 'react-inspector';
import { PageList } from './components/PageList';

function Contents(): JSX.Element {
  const { session } = useMultiplayer();
  const channel = useLazyValue(() => session.join('root'));
  // const pages: Page[] = [{ id: 'a', name: 'Page 1', type: 'page' }];
  const [serializedRoot, setSerializedRoot] = useState<any>({});
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();

  useEffect(() => {
    return channel.addListener(() => {
      const root = channel.root;
      if (!root) return;
      setSerializedRoot(serializeTree(root));
      const project = createLinkedNode(root, 'project');
      if (!project) return;
      const pages = project.children ?? [];
      setPages(pages);
    });
  }, [channel]);

  const addPage = () => {
    const root = channel.root;
    if (!root) return;
    const linked = root.get('project');
    const project = root.children.find((child) => child.id === linked);
    if (!project) return;
    const colorsPage = createNoyaObject(project, {
      type: 'colors',
      name: 'Colors Page',
    });
    // TODO: How to ensure this is atomic?
    getColorsAppData(colorsPage);
    setSelectedPageId(colorsPage.id);
  };

  const selectedPage = pages.find((page) => page.id === selectedPageId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: '#222',
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'stretch',
          flexDirection: 'row',
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: '0 0 260px',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <PageList
            pages={pages}
            onAddPage={addPage}
            onSelectPage={setSelectedPageId}
          />
        </div>
        <div style={{ display: 'flex', flex: 1, background: 'red' }}>
          {selectedPage && (
            <ColorsEditorContent
              appData={selectedPage}
              userId={session.userId!}
              getObject={(id: string) => channel.objects[id]}
            />
          )}
        </div>
      </div>
      <Inspector theme="chromeDark" table={false} data={serializedRoot} />
    </div>
  );
}

function App() {
  const workspaceState = useMemo(
    () => createInitialWorkspaceState(createSketchFile()),
    [],
  );

  return (
    <Suspense fallback="Loading">
      <PipelineProvider>
        <MultiplayerProvider>
          <CanvasKitProvider>
            <FontManagerProvider>
              <StateProvider state={workspaceState}>
                <DesignSystemConfigurationProvider
                  theme={darkTheme}
                  platform={'key'}
                >
                  <Contents />
                </DesignSystemConfigurationProvider>
              </StateProvider>
            </FontManagerProvider>
          </CanvasKitProvider>
        </MultiplayerProvider>
      </PipelineProvider>
    </Suspense>
  );
}

export default App;
