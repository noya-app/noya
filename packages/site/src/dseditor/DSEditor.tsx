import { DesignSystemDefinition } from '@noya-design-system/protocol';
import JavascriptPlayground, { PlaygroundProps } from 'javascript-playgrounds';
import { useRouter } from 'next/router';
import { DS } from 'noya-api';
import {
  clean,
  compile,
  createElementCode,
  createSimpleElement,
  print,
} from 'noya-compiler';
import {
  Model,
  NoyaComponent,
  NoyaResolvedNode,
  NoyaResolvedString,
  ResolvedHierarchy,
  SelectedComponent,
  diffResolvedTrees,
  instantiateResolvedComponent,
  renderResolvedNode,
} from 'noya-component';
import {
  Chip,
  DividerVertical,
  GridView,
  RadioGroup,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import { uuid } from 'noya-utils';
import React, { useCallback, useEffect, useMemo } from 'react';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { ViewType } from '../ayon/types';
import { ShareProjectButton } from '../components/ShareMenu';
import { useProject } from '../contexts/ProjectContext';
import { DSComponentInspector } from './DSComponentInspector';
import { DSComponentThumbnail } from './DSComponentThumbnail';
import { DSControlledRenderer } from './DSControlledRenderer';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, IDSRenderer } from './DSRenderer';
import { DSRendererOverlay } from './DSRendererOverlay';
import { initialComponents } from './builtins';
import { renderDSPreview } from './renderDSPreview';

const noop = () => {};

interface Props {
  name: string;
  initialDocument: DS;
  onChangeDocument?: (document: DS) => void;
  onChangeName?: (name: string) => void;
  viewType?: ViewType;
}
export function DSEditor({
  initialDocument,
  onChangeDocument = noop,
  name: fileName,
  onChangeName = noop,
  viewType,
}: Props) {
  const { query } = useRouter();
  const fileId = query.id as string;
  const initialComponentId = query.component as string | undefined;
  const library = query.library as string | undefined;
  const isThumbnail = library === 'thumbnail';

  const theme = useDesignSystemTheme();
  const [ds, setDS] = React.useState(initialDocument);
  const project = useProject();

  let {
    source: { name: sourceName },
    config,
    components = initialComponents,
  } = ds as DS & {
    components: NoyaComponent[];
  };

  if (library) {
    sourceName = library;
  }

  const setComponents = useCallback((components: NoyaComponent[]) => {
    setDS((ds) => ({
      ...ds,
      components,
    }));
  }, []);

  useEffect(() => {
    onChangeDocument(ds);
  }, [onChangeDocument, ds]);

  let [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(sourceName);

      setSystem(system);
    }

    setSystem(undefined);
    fetchLibrary();
  }, [sourceName]);

  const [selection, setSelection] = React.useState<
    SelectedComponent | undefined
  >(initialComponentId ? { componentID: initialComponentId } : undefined);

  const [highlightedPath, setHighlightedPath] = React.useState<
    string[] | undefined
  >();

  const findComponent = useCallback(
    (id: string) =>
      components.find((component) => component.componentID === id),
    [components],
  );

  const handleNewComponent = useCallback(
    (componentID?: string) => {
      const newComponent = Model.component({
        componentID: componentID ?? uuid(),
        rootElement: Model.primitiveElement({
          componentID: boxSymbolId,
        }),
      });

      setComponents([...components, newComponent]);
      setSelection({
        componentID: newComponent.componentID,
      });
    },
    [components, setComponents],
  );

  const handleCreateComponent = useCallback(
    (component: NoyaComponent) => {
      setComponents([...components, component]);
    },
    [components, setComponents],
  );

  const handleDeleteComponent = useCallback(
    (componentID: string) => {
      setSelection(undefined);
      setComponents(components.filter((c) => c.componentID !== componentID));
    },
    [components, setComponents],
  );

  const handleChangeComponent = useCallback(
    (component: NoyaComponent) => {
      setComponents(
        components.map((c) =>
          c.componentID === component.componentID ? component : c,
        ),
      );
    },
    [components, setComponents],
  );

  const handleSetTextAtPath = useCallback(
    ({ path, value }: { path: string[]; value: string }) => {
      setSelection((selection) => {
        if (!selection) return selection;

        const instance = instantiateResolvedComponent(findComponent, {
          componentID: selection.componentID,
          variantID: selection.variantID,
          diff: selection.diff,
        });

        const indexPath = ResolvedHierarchy.findIndexPath(
          instance,
          (node) => node.path.join('/') === path.join('/'),
        );

        if (!indexPath) return selection;

        const originalNode = ResolvedHierarchy.access(
          instance,
          indexPath,
        ) as NoyaResolvedString;

        const newResolvedNode = ResolvedHierarchy.replace(instance, {
          at: indexPath,
          node: { ...originalNode, value },
        });

        const initialInstance = instantiateResolvedComponent(findComponent, {
          componentID: selection.componentID,
          variantID: selection.variantID,
        });

        const diff = diffResolvedTrees(initialInstance, newResolvedNode);

        return { ...selection, diff };
      });
    },
    [findComponent],
  );

  const resolvedNode = useMemo(() => {
    if (!selection) return undefined;
    return instantiateResolvedComponent(findComponent, selection);
  }, [findComponent, selection]);

  const currentComponent = useMemo(() => {
    if (!selection) return undefined;
    return findComponent(selection.componentID);
  }, [findComponent, selection]);

  const chrome = currentComponent?.thumbnail?.chrome;

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selection && resolvedNode) {
        return renderDSPreview({
          renderProps: props,
          dsConfig: config,
          resolvedNode,
          canvasBackgroundColor: theme.colors.canvas.background,
          padding: viewType === 'preview' ? 0 : 20,
          isThumbnail,
          chrome,
          highlight: highlightedPath
            ? { path: highlightedPath, color: theme.colors.primary }
            : undefined,
        });
      }
      return null;
    },
    [
      selection,
      resolvedNode,
      theme.colors.canvas.background,
      theme.colors.primary,
      highlightedPath,
      config,
      viewType,
      isThumbnail,
      chrome,
    ],
  );

  const rendererRef = React.useRef<IDSRenderer>(null);

  const handleSelectComponent = useCallback(
    (componentId?: string) => {
      setSelection(componentId ? { componentID: componentId } : undefined);
    },
    [setSelection],
  );

  type ContentTabName = 'preview' | 'code';

  const [contentTab, setContentTab] = React.useState<ContentTabName>('preview');

  useEffect(() => {
    project.setRightToolbar(
      <>
        <Stack.H width="160px">
          <RadioGroup.Root
            id="content-tab"
            value={contentTab}
            onValueChange={setContentTab}
          >
            <RadioGroup.Item value="preview">Preview</RadioGroup.Item>
            <RadioGroup.Item value="code">Code</RadioGroup.Item>
          </RadioGroup.Root>
        </Stack.H>
        <ShareProjectButton fileId={fileId} />
      </>,
    );
  }, [contentTab, fileId, project]);

  return (
    <Stack.H flex="1" separator={<DividerVertical />}>
      {viewType !== 'preview' && (
        <DSProjectInspector
          name={fileName}
          findComponent={findComponent}
          onChangeName={onChangeName}
          system={system}
          ds={ds}
          setDS={setDS}
          selectedComponentID={selection?.componentID}
          onSelectComponent={handleSelectComponent}
          components={components}
          onNewComponent={handleNewComponent}
          onDeleteComponent={handleDeleteComponent}
          onMoveComponent={(componentID, index) => {
            const removalIndex = components.findIndex(
              (c) => c.componentID === componentID,
            );

            if (removalIndex === -1) return;

            const component = components[removalIndex];
            const newComponents = [...components];

            newComponents.splice(removalIndex, 1);
            newComponents.splice(
              index < removalIndex ? index : index - 1,
              0,
              component,
            );

            setComponents(newComponents);
          }}
        />
      )}
      <Stack.V flex="1">
        {selection ? (
          <Stack.V flex="1">
            {contentTab === 'preview' && (
              <Stack.V flex="1" overflow="hidden" position="relative">
                <DSControlledRenderer
                  ref={rendererRef}
                  sourceName={sourceName}
                  config={config}
                  renderContent={handleRenderContent}
                  getStringValueAtPath={(path) => {
                    if (!resolvedNode) return undefined;

                    return ResolvedHierarchy.find<NoyaResolvedString>(
                      resolvedNode,
                      (node): node is NoyaResolvedString =>
                        node.type === 'noyaString' &&
                        node.path.join('/') === path.join('/'),
                    )?.value;
                  }}
                  onChangeTextAtPath={handleSetTextAtPath}
                />
                <DSRendererOverlay rendererRef={rendererRef} />
              </Stack.V>
            )}
            {contentTab === 'code' && resolvedNode && system && (
              <DSComponentCode
                resolvedNode={resolvedNode}
                system={system}
                dsConfig={config}
              />
            )}
          </Stack.V>
        ) : (
          <Stack.V flex="1">
            {contentTab === 'preview' && (
              <GridView.Root size="large" textPosition="below">
                <GridView.SectionHeader title="Components" />
                <GridView.Section>
                  {components
                    .filter(
                      (component) => component.accessModifier !== 'internal',
                    )
                    .map((component) => {
                      return (
                        <GridView.Item
                          id={component.id}
                          key={component.id}
                          title={component.name}
                          subtitle={
                            <Stack.H
                              as="span"
                              display="inline-flex"
                              gap="4px"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              margin={'6px 0 0 0'}
                            >
                              {(component.tags ?? ['no tags']).map((tag) => (
                                <Chip
                                  size="small"
                                  key={tag}
                                  style={{ fontFamily: 'monospace' }}
                                  variant={
                                    tag === 'no tags' ? 'outlined' : 'solid'
                                  }
                                >
                                  {tag}
                                </Chip>
                              ))}
                            </Stack.H>
                          }
                          // menuItems={menuItems}
                          // selected={item.do_objectID === state.selectedPage}
                          // onSelectMenuItem={handleSelectMenuItem}
                          // onContextMenu={() => dispatch('selectPage', item.do_objectID)}
                          onClick={() => {
                            setSelection({
                              componentID: component.componentID,
                            });
                          }}
                        >
                          <Stack.H
                            width="100%"
                            aspectRatio="16/9"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="4px"
                            background={theme.colors.inputBackground}
                            border={`1px solid ${theme.colors.divider}`}
                          >
                            <DSComponentThumbnail
                              component={component}
                              fileId={fileId}
                            />
                          </Stack.H>
                        </GridView.Item>
                      );
                    })}
                </GridView.Section>
              </GridView.Root>
            )}
            {contentTab === 'code' && system && (
              <DSGalleryCode system={system} ds={ds} />
            )}
          </Stack.V>
        )}
      </Stack.V>
      {viewType !== 'preview' && selection && resolvedNode && (
        <DSComponentInspector
          selection={selection}
          setSelection={setSelection}
          findComponent={findComponent}
          onChangeComponent={handleChangeComponent}
          resolvedNode={resolvedNode}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
          onCreateComponent={handleCreateComponent}
          components={components}
        />
      )}
    </Stack.H>
  );
}

function DSComponentCode({
  resolvedNode,
  system,
  dsConfig,
}: {
  resolvedNode: NoyaResolvedNode;
  system: DesignSystemDefinition;
  dsConfig: DS['config'];
}) {
  const [code, setCode] = React.useState<string>();

  useEffect(() => {
    const reactNode = renderResolvedNode({
      contentEditable: false,
      disableTabNavigation: false,
      includeDataProps: true,
      system,
      dsConfig,
      resolvedNode,
    });

    const code = createElementCode(createSimpleElement(reactNode, system)!);

    const out = clean(print(code));

    setCode(out);
  }, [dsConfig, resolvedNode, system]);

  return (
    <Stack.V flex="1" background="white">
      {code !== undefined && <Playground files={{ 'index.tsx': code }} />}
    </Stack.V>
  );
}

function DSGalleryCode({
  system,
  ds,
}: {
  system: DesignSystemDefinition;
  ds: DS;
}) {
  const [files, setFiles] = React.useState<Record<string, string>>();

  useEffect(() => {
    const output = compile({
      name: 'Gallery',
      ds,
      target: 'standalone',
      designSystemDefinition: system,
    });

    setFiles(output);
  }, [ds, system]);

  return (
    <Stack.V flex="1" background="white">
      {files !== undefined && <Playground files={files} />}
    </Stack.V>
  );
}

function Playground(props: Pick<PlaygroundProps, 'files'>) {
  const theme = useDesignSystemTheme();

  return (
    <JavascriptPlayground
      key={JSON.stringify(props.files)}
      files={props.files}
      panes={['editor']}
      style={{
        width: '100%',
        height: '100%',
      }}
      styles={{
        tab: {
          backgroundColor: 'white',
        },
        tabText: {
          color: theme.colors.textMuted,
          whiteSpace: 'nowrap',
        },
        tabTextActive: {
          borderBottom: `3px solid ${theme.colors.primary}`,
          fontWeight: 500,
        },
        status: {
          display: 'none',
        },
      }}
      _css={`
        .cm-s-react .CodeMirror-gutters {
          border-left: 0;
        }
      `}
    />
  );
}
