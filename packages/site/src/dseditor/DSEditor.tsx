import { UTF16, findLast, uuid } from '@noya-app/noya-utils';
import { DesignSystemDefinition } from '@noya-design-system/protocol';
import JavascriptPlayground, { PlaygroundProps } from 'javascript-playgrounds';
import { useRouter } from 'next/router';
import { DS, useNoyaClientOrFallback } from 'noya-api';
import { compileAsync } from 'noya-compiler';
import {
  ComponentGroupTree,
  Model,
  NoyaComponent,
  NoyaResolvedPrimitiveElement,
  NoyaResolvedString,
  ResolvedHierarchy,
  SelectedComponent,
  UNCATEGORIZED,
  createRootGroup,
  diffResolvedTrees,
  getSavableComponentGroups,
  instantiateResolvedComponent,
} from 'noya-component';
import {
  Button,
  Chip,
  DividerVertical,
  GridView,
  RadioGroup,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { toZipFile } from 'noya-filesystem';
import { DownloadIcon } from 'noya-icons';
import { loadDesignSystem } from 'noya-module-loader';
import { useDeepState } from 'noya-react-utils';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { ViewType } from '../ayon/types';
import { ShareProjectButton } from '../components/ShareMenu';
import { useProject } from '../contexts/ProjectContext';
import { downloadBlob } from '../utils/download';
import { DSComponentInspector } from './DSComponentInspector';
import { DSComponentThumbnail } from './DSComponentThumbnail';
import { DSControlledRenderer } from './DSControlledRenderer';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, IDSRenderer } from './DSRenderer';
import { DSRendererOverlay, IRendererOverlay } from './DSRendererOverlay';
import { initialComponents } from './builtins';
import { renderDSPreview } from './renderDSPreview';

const noop = () => {};

interface Props {
  name: string;
  initialDocument: DS;
  onChangeDocument?: (document: DS) => void;
  onChangeName?: (name: string) => void;
  uploadAsset?: (file: ArrayBuffer) => Promise<string>;
  viewType?: ViewType;
}
export function DSEditor({
  initialDocument,
  onChangeDocument = noop,
  name: fileName,
  onChangeName = noop,
  uploadAsset,
  viewType,
}: Props) {
  const router = useRouter();
  const { query } = router;
  const fileId = query.id as string;
  const initialComponentId = query.component as string | undefined;
  const library = query.library as string | undefined;
  const isThumbnail = library === 'thumbnail';

  const theme = useDesignSystemTheme();
  const [ds, setDS] = React.useState<DS>(initialDocument);
  const project = useProject();

  let { source, config, components = initialComponents, groups } = ds;

  const librarySource = useMemo(() => {
    if (library) {
      return {
        ...source,
        name: library,
      };
    }

    return source;
  }, [library, source]);

  const setComponents = useCallback((components: NoyaComponent[]) => {
    setDS((ds) => ({
      ...ds,
      components,
    }));
  }, []);

  const setLatestBuildAssetId = useCallback(
    (latestBuildAssetId: string | undefined) => {
      setDS((ds) => ({
        ...ds,
        latestBuildAssetId: latestBuildAssetId,
      }));
    },
    [],
  );

  useEffect(() => {
    onChangeDocument(ds);
  }, [onChangeDocument, ds]);

  let [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(
        librarySource.name,
        librarySource.version,
      );

      setSystem(system);
    }

    setSystem(undefined);
    fetchLibrary();
  }, [librarySource]);

  const [_selection, _setSelection] = React.useState<
    Pick<SelectedComponent, 'diff' | 'variantID'>
  >({});

  const selection: SelectedComponent | undefined = useMemo(
    () =>
      initialComponentId
        ? { ..._selection, componentID: initialComponentId }
        : undefined,
    [_selection, initialComponentId],
  );

  /**
   * Sync selection with route
   */
  const setSelection: Dispatch<SetStateAction<SelectedComponent | undefined>> =
    useCallback(
      (selection) => {
        const newSelection =
          typeof selection === 'function'
            ? selection(
                initialComponentId
                  ? { ..._selection, componentID: initialComponentId }
                  : undefined,
              )
            : selection;

        _setSelection(newSelection || {});

        // Set route 'component' param using next router
        if (newSelection?.componentID !== initialComponentId) {
          const { component, ...rest } = router.query;

          router.push({
            pathname: router.pathname,
            query: {
              ...rest,
              ...(newSelection?.componentID && {
                component: newSelection.componentID,
              }),
            },
          });
        }
      },
      [_selection, initialComponentId, router],
    );

  const [highlightedPath, setHighlightedPath] = useDeepState<
    string[] | undefined
  >();

  const [selectedPath, setSelectedPath] = React.useState<string[] | undefined>(
    undefined,
  );

  const findComponent = useCallback(
    (id: string) =>
      components.find((component) => component.componentID === id),
    [components],
  );

  const handleNewComponent = useCallback(
    (componentID?: string, groupID?: string) => {
      const newComponent = Model.component({
        ...(groupID && groupID !== UNCATEGORIZED && { groupID }),
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
    [components, setComponents, setSelection],
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
    [components, setComponents, setSelection],
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
    [findComponent, setSelection],
  );

  const handleSplitNodeAtPath = useCallback(
    ({ path, range }: { path: string[]; range: [number, number] }) => {
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

        const stringNode = ResolvedHierarchy.access(
          instance,
          indexPath,
        ) as NoyaResolvedString;

        // Last primitive ancestor
        const primitive = findLast(
          ResolvedHierarchy.accessPath(instance, indexPath),
          (n) => n.type === 'noyaPrimitiveElement',
        ) as NoyaResolvedPrimitiveElement | undefined;

        if (!primitive) return selection;

        const childIndex = indexPath[indexPath.length - 1];
        const beforeChildren = primitive.children.slice(0, childIndex);
        const afterChildren = primitive.children.slice(childIndex + 1);

        const beforeText = stringNode.value.slice(0, range[0]);
        const afterText = stringNode.value.slice(range[1]);

        const newNodes: NoyaResolvedPrimitiveElement[] = [
          {
            ...ResolvedHierarchy.clone(primitive),
            children: [
              ...beforeChildren,
              {
                ...ResolvedHierarchy.clone(stringNode),
                value: beforeText.trimEnd(),
              },
            ],
          },
          {
            ...ResolvedHierarchy.clone(primitive),
            children: [
              {
                ...ResolvedHierarchy.clone(stringNode),
                value: afterText.trimStart(),
              },
              ...afterChildren,
            ],
          },
        ];

        const primitiveIndexPath = indexPath.slice(0, -1);

        let newResolvedNode = ResolvedHierarchy.remove(instance, {
          indexPaths: [primitiveIndexPath],
        });

        // insert
        newResolvedNode = ResolvedHierarchy.insert(newResolvedNode, {
          at: primitiveIndexPath,
          nodes: newNodes,
        });

        const initialInstance = instantiateResolvedComponent(findComponent, {
          componentID: selection.componentID,
          variantID: selection.variantID,
        });

        const diff = diffResolvedTrees(initialInstance, newResolvedNode);

        return { ...selection, diff };
      });
    },
    [findComponent, setSelection],
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
          height: currentComponent?.preview?.height,
        });
      }
      return null;
    },
    [
      selection,
      resolvedNode,
      config,
      theme.colors.canvas.background,
      viewType,
      isThumbnail,
      chrome,
      currentComponent?.preview?.height,
    ],
  );

  const rendererRef = React.useRef<IDSRenderer>(null);
  const overlayRef = React.useRef<IRendererOverlay>(null);

  const handleContentDidChange = useCallback(() => {
    overlayRef.current?.update();
  }, []);

  const handlePressMeasure = useCallback(() => {
    if (!resolvedNode || !currentComponent) return;

    const rect = overlayRef.current?.measureElementAtPath(resolvedNode.path);

    handleChangeComponent({
      ...currentComponent,
      preview: {
        ...currentComponent?.preview,
        height: rect?.height,
      },
    });
  }, [currentComponent, handleChangeComponent, resolvedNode]);

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

  useEffect(() => {
    const componentName = components.find(
      (component) => component.componentID === selection?.componentID,
    )?.name;

    project.setProjectPath(componentName);
  }, [components, project, selection?.componentID]);

  const getStringValueAtPath = useCallback(
    (path) => {
      if (!resolvedNode) return undefined;

      return ResolvedHierarchy.find<NoyaResolvedString>(
        resolvedNode,
        (node): node is NoyaResolvedString =>
          node.type === 'noyaString' && node.path.join('/') === path.join('/'),
      )?.value;
    },
    [resolvedNode],
  );

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
          groups={groups}
          onNewComponent={handleNewComponent}
          onDeleteComponent={handleDeleteComponent}
          onMoveComponent={(componentID, index, groupID) => {
            const removalIndex = components.findIndex(
              (c) => c.componentID === componentID,
            );

            if (removalIndex === -1) return;

            let component = components[removalIndex];

            if (groupID) {
              component = { ...component, groupID };
            }

            const newComponents = [...components];

            newComponents.splice(removalIndex, 1);
            newComponents.splice(
              index < removalIndex ? index : index - 1,
              0,
              component,
            );

            setComponents(newComponents);
          }}
          onDeleteGroup={(groupID) => {
            setDS((ds) => ({
              ...ds,
              groups: ds.groups?.filter((g) => g.id !== groupID),
            }));
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
                  librarySource={librarySource}
                  config={config}
                  renderContent={handleRenderContent}
                  getStringValueAtPath={getStringValueAtPath}
                  onChangeTextAtPath={handleSetTextAtPath}
                  onSplitNodeAtPath={handleSplitNodeAtPath}
                  setHighlightedPath={setHighlightedPath}
                  setSelectedPath={setSelectedPath}
                  onContentDidChange={handleContentDidChange}
                />
                <DSRendererOverlay
                  ref={overlayRef}
                  rendererRef={rendererRef}
                  highlightedPath={highlightedPath}
                />
              </Stack.V>
            )}
            {contentTab === 'code' && system && (
              <DSGalleryCode
                system={system}
                ds={ds}
                setLatestBuildAssetId={setLatestBuildAssetId}
                componentID={selection.componentID}
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
              <DSGalleryCode
                system={system}
                ds={ds}
                setLatestBuildAssetId={setLatestBuildAssetId}
              />
            )}
          </Stack.V>
        )}
      </Stack.V>
      {viewType !== 'preview' && selection && resolvedNode && (
        <DSComponentInspector
          key={selection.componentID} // Use key to reset any navigation state
          selection={selection}
          setSelection={setSelection}
          findComponent={findComponent}
          onChangeComponent={handleChangeComponent}
          resolvedNode={resolvedNode}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
          onCreateComponent={handleCreateComponent}
          components={components}
          onPressMeasure={handlePressMeasure}
          groups={groups}
          uploadAsset={uploadAsset}
          onCreateGroup={(group, parentID) => {
            const groupID = uuid();
            const root = createRootGroup(groups);
            const parentIndexPath = ComponentGroupTree.findIndexPath(
              root,
              (g) => g.id === parentID,
            );
            const parent = parentIndexPath
              ? ComponentGroupTree.access(root, parentIndexPath)
              : root;
            const childrenLength = parent.children?.length ?? 0;

            const newRoot = ComponentGroupTree.insert(root, {
              nodes: [group],
              at: parentIndexPath
                ? [...parentIndexPath, childrenLength]
                : [childrenLength],
            });

            setDS((ds) => ({
              ...ds,
              groups: getSavableComponentGroups(newRoot),
            }));

            return groupID;
          }}
        />
      )}
    </Stack.H>
  );
}

function DSGalleryCode({
  system,
  ds,
  setLatestBuildAssetId,
  componentID,
}: {
  system: DesignSystemDefinition;
  ds: DS;
  setLatestBuildAssetId?: (latestBuildAssetId: string | undefined) => void;
  componentID?: string;
}) {
  const [files, setFiles] = React.useState<Record<string, string>>();

  useEffect(() => {
    async function main() {
      const output = await compileAsync({
        name: 'Gallery',
        ds,
        definitions: componentID
          ? [ds.source.name]
          : [
              'vanilla',
              '@noya-design-system/chakra',
              '@noya-design-system/antd',
              '@noya-design-system/mui',
            ],
        ...(componentID && {
          filterComponents: (component) =>
            component.componentID === componentID,
        }),
      });

      setFiles(output);
    }

    main();
  }, [componentID, ds, system]);

  return (
    <Stack.V flex="1" background="white">
      {files !== undefined && (
        <Playground
          files={files}
          setLatestBuildAssetId={setLatestBuildAssetId}
        />
      )}
    </Stack.V>
  );
}

function Playground(
  props: Pick<PlaygroundProps, 'files'> & {
    setLatestBuildAssetId?: (latestBuildAssetId: string | undefined) => void;
  },
) {
  const theme = useDesignSystemTheme();
  const client = useNoyaClientOrFallback();
  const router = useRouter();
  const { query } = router;
  const fileId = query.id as string;

  async function createZip() {
    return await toZipFile(
      Object.fromEntries(
        Object.entries(props.files ?? {}).map(([name, content]) => [
          name,
          UTF16.toUTF8(content),
        ]),
      ),
      'App.zip',
    );
  }

  const first50Files = useMemo(() => {
    const entries = Object.entries(props.files ?? {});

    if (entries.length <= 50) return props.files;

    return Object.fromEntries(entries.slice(0, 50));
  }, [props.files]);

  return (
    <>
      <JavascriptPlayground
        key={JSON.stringify(first50Files)}
        files={first50Files}
        panes={[
          {
            id: 'editor',
            type: 'editor',
            fileList:
              Object.keys(first50Files ?? {}).length > 1
                ? 'sidebar'
                : undefined,
          },
        ]}
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
          workspacesList: {
            borderRight: `1px solid ${theme.colors.divider}`,
            padding: '4px',
            backgroundColor: 'white',
            flex: '0 0 300px',
          },
          workspacesRow: {
            backgroundColor: 'white',
            borderLeftWidth: 0,
            // padding: '0px 4px',
          },
          workspacesRowTitle: {
            padding: '9px 12px',
          },
          workspacesRowTitleActive: {
            backgroundColor: theme.colors.primary,
            borderRadius: '4px',
          },
          workspacesRowActive: {
            backgroundColor: 'white',
          },
          workspacesDivider: {
            flex: '0 0 2px',
          },
        }}
        _css={`
        .cm-s-react .CodeMirror-gutters {
          border-left: 0;
        }
      `}
      />
      <Stack.H position="absolute" top="10px" right="20px" gap="20px">
        <Button
          variant="secondary"
          onClick={async () => {
            const zipFile = await createZip();
            downloadBlob(zipFile);
          }}
        >
          Download ZIP
          <Spacer.Horizontal size={6} inline />
          <DownloadIcon />
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            const zipFile = await createZip();
            const bytes = await zipFile.arrayBuffer();

            const build = await fetch('http://localhost:31114/build', {
              method: 'POST',
              body: bytes,
              headers: {
                'Content-Type': 'application/zip',
              },
            });

            const binary = await build.arrayBuffer();

            const assetId = await client.assets.create(binary, fileId);

            props.setLatestBuildAssetId?.(assetId);

            const url = `${client.assets.url(assetId)}/index.html`;

            console.info('Uploaded to', assetId, url);

            window.open(url, '_blank')?.focus();
          }}
        >
          Upload ZIP
          <Spacer.Horizontal size={6} inline />
          <DownloadIcon />
        </Button>
      </Stack.H>
    </>
  );
}
