import {
  Chip,
  CompletionItem,
  CompletionSectionHeader,
  IconButton,
  InputField,
  InputFieldWithCompletions,
  RelativeDropPosition,
  Stack,
  TreeView,
  createSectionedMenu,
  useDesignSystemTheme,
  useOpenInputDialog,
} from '@noya-app/noya-designsystem';
import {
  BoxModelIcon,
  CaretDownIcon,
  ClipboardCopyIcon,
  ClipboardIcon,
  CopyIcon,
  DownloadIcon,
  DropdownMenuIcon,
  EnterIcon,
  ExitIcon,
  FontStyleIcon,
  GlobeIcon,
  ImageIcon,
  InputIcon,
  Link1Icon,
  MixerHorizontalIcon,
  OpenInNewWindowIcon,
  PlusCircledIcon,
  ShuffleIcon,
  ThickArrowDownIcon,
  ThickArrowUpIcon,
  TrashIcon,
  UploadIcon,
  VercelLogoIcon,
} from '@noya-app/noya-icons';
import { useKeyboardShortcuts } from '@noya-app/noya-keymap';
import { tailwindColors } from '@noya-app/noya-tailwind';
import { isDeepEqual, uuid } from '@noya-app/noya-utils';
import { Theme, component } from '@noya-design-system/protocol';
import { fileOpen } from 'browser-fs-access';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import { DS, DSConfig, useNoyaClientOrFallback } from 'noya-api';
import {
  FindComponent,
  Model,
  NoyaComponent,
  NoyaGeneratorProp,
  NoyaPrimitiveElement,
  NoyaProp,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
  ResolvedHierarchy,
  createResolvedNode,
  createSVG,
  getComponentName,
  getNodeName,
  randomSeed,
  resolvedNodeReducer,
  svgToReactElement,
  unresolve,
} from 'noya-component';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IndexPath } from 'tree-visit';
import { z } from 'zod';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { downloadBlob } from '../utils/download';
import { StyleInputField } from './StyleInputField';
import { typeItems } from './completionItems';
import { exportLayout, parseLayoutWithOptions } from './componentLayout';

type LayoutTreeItem = {
  depth: number;
  indexPath: number[];
  key: string;
  node: NoyaResolvedNode;
  path: string[];
  expanded?: boolean;
};

function flattenResolvedNode(
  resolvedNode: NoyaResolvedNode,
  expanded: Record<string, boolean>,
): LayoutTreeItem[] {
  let result: LayoutTreeItem[] = [];

  ResolvedHierarchy.visit(resolvedNode, (node, indexPath) => {
    const depth = indexPath.length;

    if (node.type === 'noyaString') return;

    const key = node.path.join('/');

    const item = {
      node,
      depth,
      indexPath: indexPath.slice(),
      key,
      path: node.path,
      expanded: expanded[key] ?? node.type !== 'noyaCompositeElement',
    };

    result.push(item);

    if (item.expanded === false) {
      return 'skip';
    }
  });

  return result;
}

interface Props {
  dsConfig?: DSConfig;
  onChange: (resolvedNode: NoyaResolvedNode) => void;
  findComponent: FindComponent;
  resolvedNode: NoyaResolvedNode;
  highlightedPath?: string[];
  selectedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
  setSelectedPath: (path: string[] | undefined) => void;
  onCreateComponent?: (component: NoyaComponent) => void;
  components?: NoyaComponent[];
  onConfigureProp?: (
    options: { path: string[]; prop: string } | undefined,
  ) => void;
  uploadAsset?: (file: ArrayBuffer) => Promise<string>;
}

/**
 * The resolved node already has the diff applied, so we don't need to pass the diff separately.
 */
export const DSLayoutTree = memo(function DSLayoutTree({
  onChange,
  findComponent,
  resolvedNode,
  highlightedPath,
  setHighlightedPath,
  selectedPath,
  setSelectedPath,
  onCreateComponent,
  components,
  onConfigureProp,
  uploadAsset,
  dsConfig,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const handleSetExpanded = useCallback((id: string, expanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: expanded }));
  }, []);

  const flattened = useMemo(
    () => flattenResolvedNode(resolvedNode, expanded),
    [expanded, resolvedNode],
  );

  const [editingId, setEditingId] = useState<string | undefined>();

  useKeyboardShortcuts({
    'Mod-d': () => {
      const indexPath = ResolvedHierarchy.findIndexPath(resolvedNode, (n) =>
        isDeepEqual(n.path, selectedPath),
      );

      if (!indexPath) return;

      const parent = ResolvedHierarchy.access(
        resolvedNode,
        indexPath.slice(0, -1),
      );

      if (!parent || parent.type !== 'noyaPrimitiveElement') return;

      onChange(
        resolvedNodeReducer(resolvedNode, {
          type: 'duplicateNode',
          indexPath,
        }),
      );
    },
    // Add a box into either the selected element or the first primitive element
    '+': () => {
      const selectedElement = ResolvedHierarchy.findTypeByPath(
        resolvedNode,
        selectedPath,
        'noyaPrimitiveElement',
      );

      const primitiveElement =
        ResolvedHierarchy.find<NoyaResolvedPrimitiveElement>(
          resolvedNode,
          (n): n is NoyaResolvedPrimitiveElement =>
            n.type === 'noyaPrimitiveElement',
        );

      const target = selectedElement ?? primitiveElement;

      if (!target) return;

      const child = createResolvedNode({
        findComponent,
        node: Model.primitiveElement(component.id.Box),
      });

      const indexPath = ResolvedHierarchy.findIndexPath(
        resolvedNode,
        (n) => n === target,
      );

      if (!indexPath) return;

      onChange(
        resolvedNodeReducer(resolvedNode, {
          type: 'insertNode',
          indexPath,
          node: child,
        }),
      );
    },
  });

  const rowRefs = useRef<Record<string, ILayoutRow | null>>({});

  const focusPath = useCallback(
    (path?: string[]) => {
      if (!path) return;

      setSelectedPath(path);
      const row = rowRefs.current[path.join('/')];
      row?.focus();
    },
    [setSelectedPath],
  );

  const handlePressDirection = useCallback(
    (indexPath: IndexPath, direction: 'up' | 'down') => {
      const index = flattened.findIndex((item) =>
        isDeepEqual(item.indexPath, indexPath),
      );

      const next =
        direction === 'up' ? flattened[index - 1] : flattened[index + 1];

      if (!next) return;

      focusPath(next.path);
    },
    [flattened, focusPath],
  );

  return (
    <TreeView.Root
      keyExtractor={(obj) => obj.key}
      data={flattened}
      expandable={false}
      variant="bare"
      indentation={24}
      gap={4}
      sortable
      pressEventName="onPointerDown"
      onPress={() => {
        setSelectedPath(undefined);
      }}
      acceptsDrop={(sourceIndex, destinationIndex, relationDropPosition) => {
        const { indexPath: sourcePath } = flattened[sourceIndex];
        const { indexPath: destinationPath } = flattened[destinationIndex];

        // Don't allow dragging the root
        if (sourcePath.length === 0) {
          return false;
        }

        // Don't allow dragging above or below the root
        if (destinationPath.length === 0 && relationDropPosition !== 'inside') {
          return false;
        }

        const originalParent = ResolvedHierarchy.access(
          resolvedNode,
          sourcePath.slice(0, -1),
        );

        // Don't allow dragging the child of a composite element
        if (originalParent.type === 'noyaCompositeElement') {
          return false;
        }

        const newParent = ResolvedHierarchy.access(
          resolvedNode,
          relationDropPosition === 'inside'
            ? destinationPath
            : destinationPath.slice(0, -1),
        );

        // Don't allow dragging into a non-primitive element
        if (newParent.type !== 'noyaPrimitiveElement') {
          return false;
        }

        // Don't allow dragging into a descendant
        if (
          isDeepEqual(sourcePath, destinationPath.slice(0, sourcePath.length))
        ) {
          return false;
        }

        return true;
      }}
      onMoveItem={(
        sourceIndex: number,
        destinationIndex: number,
        position: RelativeDropPosition,
      ) => {
        const sourceItem = flattened[sourceIndex];
        const destinationItem = flattened[destinationIndex];

        const updated = handleMoveItem(
          resolvedNode,
          position,
          sourceItem.indexPath,
          destinationItem.indexPath,
        );

        onChange(updated);
      }}
      renderItem={(
        { depth, key, indexPath, node, path, expanded },
        index,
        { isDragging },
      ) => (
        <DSLayoutRow
          ref={(ref) => {
            rowRefs.current[key] = ref;
          }}
          id={key}
          key={key}
          expanded={expanded}
          onChange={onChange}
          resolvedNode={resolvedNode}
          findComponent={findComponent}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
          depth={depth}
          indexPath={indexPath}
          node={node}
          path={path}
          isDragging={isDragging}
          isEditing={editingId === key}
          setEditingId={setEditingId}
          onCreateComponent={onCreateComponent}
          components={components}
          onSetExpanded={handleSetExpanded}
          focusPath={focusPath}
          onConfigureProp={onConfigureProp}
          onPressDown={() => handlePressDirection(indexPath, 'down')}
          onPressUp={() => handlePressDirection(indexPath, 'up')}
          uploadAsset={uploadAsset}
          dsConfig={dsConfig}
        />
      )}
    />
  );
});

interface ILayoutRow {
  focus(): void;
}

export const DSLayoutRow = memo(
  forwardRef(function DSLayerRow(
    {
      id,
      onChange,
      resolvedNode,
      findComponent,
      highlightedPath,
      setHighlightedPath,
      selectedPath,
      setSelectedPath,
      depth,
      indexPath,
      node,
      path,
      isDragging,
      isEditing,
      setEditingId,
      onCreateComponent,
      components,
      expanded,
      onSetExpanded,
      onConfigureProp,
      onPressUp,
      onPressDown,
      focusPath,
      uploadAsset,
      dsConfig,
    }: Pick<
      Props,
      | 'highlightedPath'
      | 'setHighlightedPath'
      | 'selectedPath'
      | 'setSelectedPath'
      | 'onConfigureProp'
      | 'uploadAsset'
    > & {
      id: string;
      onChange: (resolvedNode: NoyaResolvedNode) => void;
      resolvedNode: NoyaResolvedNode;
      findComponent: FindComponent;
      depth: number;
      key: string;
      indexPath: number[];
      node: NoyaResolvedNode;
      path: string[];
      isDragging: boolean;
      isEditing: boolean;
      setEditingId: (id: string | undefined) => void;
      expanded?: boolean;
      onSetExpanded: (id: string, expanded: boolean) => void;
      onPressUp: () => void;
      onPressDown: () => void;
      focusPath: (path?: string[]) => void;
    } & Pick<Props, 'onCreateComponent' | 'components' | 'dsConfig'>,
    forwardedRef: React.ForwardedRef<ILayoutRow>,
  ) {
    const client = useNoyaClientOrFallback();
    const theme = useDesignSystemTheme();
    const parent = ResolvedHierarchy.access(
      resolvedNode,
      indexPath.slice(0, -1),
    );
    const name = getNodeName(node, findComponent);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const styleSearchInputRef = React.useRef<HTMLInputElement>(null);
    const [isSearchingStyles, setIsSearchingStyles] = React.useState(false);

    useEffect(() => {
      if (isSearchingStyles) {
        styleSearchInputRef.current?.focus();
      }
    }, [isSearchingStyles]);

    const typeSearchInputRef = React.useRef<HTMLInputElement>(null);
    const [isSearchingTypes, setIsSearchingTypes] = React.useState(false);

    useEffect(() => {
      if (isSearchingTypes) {
        typeSearchInputRef.current?.focus();
      }
    }, [isSearchingTypes]);

    const variantInputRef = React.useRef<HTMLInputElement>(null);
    const [isSearchingVariants, setIsSearchingVariants] = React.useState(false);

    useEffect(() => {
      if (isSearchingVariants) {
        variantInputRef.current?.focus();
      }
    }, [isSearchingVariants]);

    const menu = createSectionedMenu(
      [
        node.type === 'noyaPrimitiveElement' && {
          title: 'Add Child',
          value: 'addChild',
          icon: <PlusCircledIcon />,
        },
        depth !== 0 &&
          parent.type === 'noyaPrimitiveElement' && {
            title: 'Duplicate',
            value: 'duplicate',
            icon: <CopyIcon />,
          },
        depth !== 0 &&
          parent.type === 'noyaPrimitiveElement' && {
            title: 'Delete',
            value: 'delete',
            icon: <TrashIcon />,
          },
      ],
      [
        {
          title: 'Wrap within Box',
          value: 'wrapWithinBox',
          icon: <ThickArrowUpIcon />,
        },
        node.type === 'noyaPrimitiveElement' &&
          node.children.length > 0 && {
            title: 'Replace with First Child',
            value: 'replaceWithFirstChild',
            icon: <ThickArrowDownIcon />,
          },
      ],
      [
        {
          title: 'Rename',
          value: 'rename',
          icon: <InputIcon />,
        },
        node.type === 'noyaPrimitiveElement' && {
          title: 'Add Style',
          value: 'addStyle',
          icon: <FontStyleIcon />,
        },
        node.type === 'noyaPrimitiveElement' && {
          title: 'Pick Component',
          value: 'addType',
          icon: <DropdownMenuIcon />,
        },
      ],
      [
        {
          title: 'Open in Editor',
          value: 'openComponent',
          icon: <OpenInNewWindowIcon />,
        },
        {
          title: 'Extract to New Component',
          value: 'extractToComponent',
          icon: <EnterIcon />,
        },
        node.type === 'noyaCompositeElement' && {
          title: 'Replace with Contents',
          value: 'replaceWithContents',
          icon: <ExitIcon />,
        },
      ],
      [
        {
          title: 'Copy Style',
          value: 'copyStyle',
          icon: <ClipboardCopyIcon />,
        },
        { title: 'Paste Style', value: 'pasteStyle', icon: <ClipboardIcon /> },
      ],
      [
        {
          title: 'Copy JSX',
          value: 'copyJsx',
          icon: <ClipboardCopyIcon />,
        },
        {
          title: 'Paste JSX',
          value: 'replaceWithRawJsx',
          icon: <ClipboardIcon />,
        },
        {
          title: 'Paste and clean JSX',
          value: 'replaceWithJsx',
          icon: <ClipboardIcon />,
        },
      ],
    );
    type MenuItemType = Exclude<
      Extract<(typeof menu)[number], object>['value'],
      undefined
    >;
    const hovered = highlightedPath?.join('/') === path.join('/');
    const selected = selectedPath?.join('/') === path.join('/');
    const openInputDialog = useOpenInputDialog();
    const router = useRouter();
    const onSelectMenuItem = async (value: MenuItemType) => {
      switch (value) {
        case 'openComponent': {
          if (node.type !== 'noyaCompositeElement') return;

          const component = findComponent(node.componentID);

          if (!component) return;

          router.push({
            pathname: router.pathname,
            query: {
              ...router.query,
              component: node.componentID,
            },
          });

          break;
        }
        case 'replaceWithFirstChild': {
          onChange(
            resolvedNodeReducer(resolvedNode, {
              type: 'replaceNodeWithFirstChild',
              indexPath,
            }),
          );
          break;
        }
        case 'wrapWithinBox': {
          onChange(
            resolvedNodeReducer(resolvedNode, {
              type: 'wrapNode',
              indexPath,
              primitiveType: component.id.Box,
              findComponent,
            }),
          );
          break;
        }
        case 'extractToComponent': {
          const name = getNodeName(node, findComponent);

          const text = await openInputDialog('Component Name', name);

          if (!text) return;

          const newComponent = Model.component({
            name: text,
            componentID: uuid(),
            rootElement: unresolve(node),
          });

          onCreateComponent?.(newComponent);

          const instance = Model.compositeElement({
            componentID: newComponent.componentID,
          });

          const findComponentPlusNewComponent: FindComponent = (componentID) =>
            componentID === newComponent.componentID
              ? newComponent
              : findComponent(componentID);

          onChange(
            ResolvedHierarchy.replace(resolvedNode, {
              at: indexPath,
              node: createResolvedNode({
                findComponent: findComponentPlusNewComponent,
                node: instance,
              }),
            }),
          );

          break;
        }
        case 'replaceWithContents': {
          if (node.type !== 'noyaCompositeElement') break;

          const child = ResolvedHierarchy.clone(
            createResolvedNode({ findComponent, node: node.rootElement }),
          );

          onChange(
            ResolvedHierarchy.replace(resolvedNode, {
              at: indexPath,
              node: child,
            }),
          );

          break;
        }
        case 'replaceWithJsx':
        case 'replaceWithRawJsx': {
          const text = await navigator.clipboard.readText();
          if (!text) return;
          const layout = parseLayoutWithOptions(text, 'geometric', {
            rewrite: value === 'replaceWithJsx',
          });
          onChange(
            ResolvedHierarchy.replace(resolvedNode, {
              at: indexPath,
              node: createResolvedNode({ findComponent, node: layout }),
            }),
          );
          break;
        }
        case 'copyStyle': {
          if (node.type !== 'noyaPrimitiveElement') break;
          navigator.clipboard.writeText(
            JSON.stringify(node.classNames.map((c) => c.value)),
          );
          break;
        }
        case 'pasteStyle': {
          if (node.type !== 'noyaPrimitiveElement') break;
          const text = await navigator.clipboard.readText();
          let classNames: string[] = [];

          try {
            const json = JSON.parse(text);
            classNames = z.array(z.string()).parse(json);
          } catch (e) {
            console.error(e);
            return;
          }

          onChange(
            resolvedNodeReducer(resolvedNode, {
              type: 'addClassNames',
              indexPath,
              classNames,
            }),
          );
          break;
        }
        case 'copyJsx': {
          navigator.clipboard.writeText(exportLayout(node));
          break;
        }
        case 'rename': {
          setEditingId(id);
          break;
        }
        case 'addStyle': {
          // Wait for menu to close
          setTimeout(() => {
            setIsSearchingStyles(true);
          }, 0);
          break;
        }
        case 'addType': {
          // Wait for menu to close
          setTimeout(() => {
            setIsSearchingTypes(true);
          }, 0);
          break;
        }
        case 'duplicate': {
          onChange(
            resolvedNodeReducer(resolvedNode, {
              type: 'duplicateNode',
              indexPath,
            }),
          );

          break;
        }
        case 'delete': {
          onChange(
            resolvedNodeReducer(resolvedNode, {
              type: 'removeNode',
              indexPath,
            }),
          );
          break;
        }
        case 'addChild': {
          const child = createResolvedNode({
            findComponent,
            node: Model.primitiveElement(component.id.Box),
          });

          const updated = resolvedNodeReducer(resolvedNode, {
            type: 'insertNode',
            indexPath,
            node: child,
          });

          onChange(updated);

          const childPath = ResolvedHierarchy.keyPathOfNode(updated, child);

          setTimeout(() => {
            focusPath(childPath);
          }, 0);

          break;
        }
      }
    };

    const componentTypeItems = useMemo(
      (): (CompletionItem | CompletionSectionHeader)[] => [
        {
          type: 'sectionHeader',
          id: 'primitives',
          name: 'Primitive Elements',
        },
        ...typeItems,
        {
          type: 'sectionHeader',
          id: 'components',
          name: 'Custom Components',
        },
        ...(components ?? []).map((c) => ({
          id: c.componentID,
          name: c.name,
        })),
      ],
      [components],
    );

    const showHoverRing =
      (hovered || isMenuOpen) &&
      !isDragging &&
      !isSearchingStyles &&
      !isSearchingTypes;

    const ref = React.useRef<HTMLLIElement>(null);

    useImperativeHandle(forwardedRef, () => ({
      focus() {
        ref.current?.focus();
      },
    }));

    return (
      <TreeView.Row
        ref={ref}
        id={id}
        depth={depth - 1}
        menuItems={menu}
        onSelectMenuItem={onSelectMenuItem}
        sortable
        onMenuOpenChange={setIsMenuOpen}
        onHoverChange={(hovered) => {
          setHighlightedPath(hovered ? path : undefined);
        }}
        onPress={() => {
          setSelectedPath(path);
          ref.current?.focus();
        }}
        onKeyDown={(event) => {
          // Double check that the element is still focused.
          // This is necessary because menus contained within this view will
          // otherwise receive the keydown event.
          if (document.activeElement !== ref.current) return;

          // Check if the mod key is pressed
          if (event.metaKey || event.ctrlKey) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          switch (event.key) {
            case 'ArrowUp': {
              onPressUp();
              break;
            }
            case 'ArrowDown': {
              onPressDown();
              break;
            }
            case 'ArrowLeft': {
              onSetExpanded(id, false);
              break;
            }
            case 'ArrowRight': {
              onSetExpanded(id, true);
              break;
            }
            case '+': {
              onSelectMenuItem('addChild');
              break;
            }
            case '#': {
              if (node.type === 'noyaPrimitiveElement') {
                setIsSearchingStyles(true);
              } else if (node.type === 'noyaCompositeElement') {
                setIsSearchingVariants(true);
              }
              break;
            }
            case '/': {
              setIsSearchingTypes(true);
              break;
            }
            case 'Enter': {
              setEditingId(id);
              break;
            }
            case 'Delete':
            case 'Backspace': {
              // Prevent deleting the root
              if (depth === 0) return;

              onSelectMenuItem('delete');
              break;
            }
            case 'Escape': {
              setSelectedPath(undefined);
              break;
            }
          }
        }}
        icon={
          depth !== 0 && (
            <DraggableMenuButton
              isVisible={hovered || isMenuOpen || isDragging}
              items={menu}
              onSelect={onSelectMenuItem}
            />
          )
        }
        onDoubleClick={() => {
          setEditingId(id);
        }}
      >
        <Stack.V
          flex="1 1 0%"
          padding="1px"
          borderRadius="4px"
          gap="2px"
          border={
            showHoverRing
              ? `1px solid ${theme.colors.primary}`
              : node.type === 'noyaCompositeElement'
              ? `1px solid transparent`
              : `1px solid ${theme.colors.divider}`
          }
          background={
            selected
              ? theme.colors.primary
              : node.type === 'noyaCompositeElement'
              ? 'rgb(238, 229, 255)'
              : undefined
          }
          color={
            selected
              ? 'white'
              : node.type === 'noyaCompositeElement'
              ? theme.colors.primary
              : 'inherit'
          }
        >
          {isSearchingTypes ? (
            <InputFieldWithCompletions
              ref={typeSearchInputRef}
              placeholder={'Find component'}
              items={componentTypeItems}
              onBlur={() => {
                setIsSearchingTypes(false);
              }}
              onSelectItem={(item) => {
                setIsSearchingTypes(false);

                const component = findComponent(item.id);
                const parentPath = node.path.slice(0, -1);

                if (component) {
                  const newNode = ResolvedHierarchy.clone(
                    createResolvedNode({
                      findComponent,
                      node: Model.compositeElement({
                        componentID: item.id,
                        name: node.name ?? item.name,
                      }),
                      parentPath,
                    }),
                  );

                  const updated = ResolvedHierarchy.replace(resolvedNode, {
                    at: indexPath,
                    node: newNode,
                  });

                  onChange(updated);

                  const childPath = ResolvedHierarchy.keyPathOfNode(
                    updated,
                    newNode,
                  );

                  if (!childPath) return;

                  onSetExpanded(childPath.join('/'), true);
                } else {
                  if (node.type === 'noyaPrimitiveElement') {
                    onChange(
                      ResolvedHierarchy.replace(resolvedNode, {
                        at: indexPath,
                        node: {
                          ...cloneDeep(node),
                          componentID: item.id,
                          id: uuid(), // New id to flag as add/remove change
                        },
                      }),
                    );
                  } else {
                    onChange(
                      ResolvedHierarchy.replace(resolvedNode, {
                        at: indexPath,
                        node: createResolvedNode({
                          findComponent,
                          node: Model.primitiveElement({
                            componentID: item.id,
                            name: node.name ?? item.name,
                          }),
                          parentPath,
                        }),
                      }),
                    );
                  }
                }
              }}
              style={{
                zIndex: 1, // Focus outline should appear above chips
                background: 'transparent',
              }}
            />
          ) : isSearchingVariants && node.type === 'noyaCompositeElement' ? (
            <InputFieldWithCompletions
              ref={variantInputRef}
              placeholder={'Find variant'}
              items={
                findComponent(node.componentID)?.variants?.map(
                  (variant): CompletionItem => ({
                    id: variant.id,
                    name: variant.name || '',
                  }),
                ) ?? []
              }
              onBlur={() => {
                setIsSearchingVariants(false);
              }}
              onSelectItem={(item) => {
                setIsSearchingVariants(false);

                onChange(
                  ResolvedHierarchy.replace(resolvedNode, {
                    at: indexPath,
                    node: {
                      ...cloneDeep(node),
                      variantNames: [
                        ...(node.variantNames ?? []),
                        Model.variantName(item.id),
                      ],
                    },
                  }),
                );
              }}
              style={{
                zIndex: 1, // Focus outline should appear above chips
                background: 'transparent',
              }}
            />
          ) : isSearchingStyles ? (
            <StyleInputField
              ref={styleSearchInputRef}
              componentID={(node as NoyaPrimitiveElement).componentID}
              onBlur={() => {
                setIsSearchingStyles(false);
                ref.current?.focus();
              }}
              onSelectItem={(item) => {
                setIsSearchingStyles(false);
                ref.current?.focus();

                if (node.type !== 'noyaPrimitiveElement') return;

                onChange(
                  resolvedNodeReducer(resolvedNode, {
                    type: 'addClassNames',
                    indexPath,
                    classNames: [item.name],
                  }),
                );
              }}
              style={{
                zIndex: 1, // Focus outline should appear above chips
                background: 'transparent',
              }}
            />
          ) : node.type === 'noyaString' ? (
            <InputField.Root>
              <InputField.Input
                style={{
                  background: 'transparent',
                  color: 'dodgerblue',
                }}
                value={node.value}
                onChange={(value) => {}}
              />
            </InputField.Root>
          ) : (
            <Stack.H
              padding="4px 6px"
              alignItems="center"
              zIndex={isEditing ? 1 : undefined}
              gap="4px"
            >
              {node.type === 'noyaCompositeElement' && (
                <IconButton
                  iconName={expanded ? 'CaretDownIcon' : 'CaretRightIcon'}
                  color={theme.colors.primary}
                  onClick={() => {
                    onSetExpanded(id, !expanded);
                  }}
                  contentStyle={{
                    marginLeft: '-2px',
                  }}
                />
              )}
              {isEditing ? (
                <TreeView.EditableRowTitle
                  value={name}
                  onSubmitEditing={(value) => {
                    setEditingId(undefined);

                    onChange(
                      resolvedNodeReducer(resolvedNode, {
                        type: 'setName',
                        indexPath,
                        name: value,
                      }),
                    );
                  }}
                  autoFocus
                />
              ) : (
                <TreeView.RowTitle style={{ width: 0 }}>
                  {name}
                </TreeView.RowTitle>
              )}
              <Chip
                size="small"
                variant={hovered ? 'outlined' : 'ghost'}
                colorScheme={selected ? 'primary' : undefined}
                monospace
                style={{
                  ...(selected && {
                    color: 'white',
                  }),
                }}
                onClick={() => {
                  setIsSearchingTypes(true);
                }}
              >
                {getComponentName(node, findComponent)}
              </Chip>
            </Stack.H>
          )}
          {node.type === 'noyaCompositeElement' &&
            (findComponent(node.componentID)?.variants?.length ?? 0) > 0 && (
              <Stack.H flexWrap="wrap" gap="2px" margin={'-2px 0 0 0'}>
                {node.variantNames?.map(({ variantID, id }) => {
                  return (
                    <Chip
                      key={id}
                      size={'small'}
                      monospace
                      deletable
                      style={{
                        color: theme.colors.primary,
                        background: 'rgb(226, 211, 255)',
                      }}
                      onDelete={() => {
                        onChange(
                          ResolvedHierarchy.replace(resolvedNode, {
                            at: indexPath,
                            node: {
                              ...node,
                              variantNames: node.variantNames?.filter(
                                (variantName) => variantName.id !== id,
                              ),
                            },
                          }),
                        );
                      }}
                    >
                      {findComponent(node.componentID)?.variants?.find(
                        (variant) => variant.id === variantID,
                      )?.name ?? 'Default'}
                    </Chip>
                  );
                })}
                <Chip
                  size={'small'}
                  addable
                  monospace
                  style={{
                    color: theme.colors.primary,
                    background: 'rgb(226, 211, 255)',
                  }}
                  onAdd={() => {
                    if (isSearchingVariants) {
                      setIsSearchingVariants(false);
                    } else {
                      setIsSearchingVariants(true);
                    }
                  }}
                />
              </Stack.H>
            )}
          {node.type === 'noyaPrimitiveElement' && (
            <Stack.H flexWrap="wrap" gap="2px" margin={'-2px 0 0 0'}>
              {node.classNames.map(({ value, id }) => {
                const status = undefined;

                return (
                  <Chip
                    key={id}
                    size={'small'}
                    deletable={status !== 'removed'}
                    addable={status === 'removed'}
                    monospace
                    colorScheme={
                      selected
                        ? 'primary'
                        : status === 'added'
                        ? 'secondary'
                        : undefined
                    }
                    style={{
                      opacity: status === 'removed' ? 0.5 : 1,
                    }}
                    onDelete={() => {
                      onChange(
                        resolvedNodeReducer(resolvedNode, {
                          type: 'removeClassNames',
                          indexPath,
                          classNames: [value],
                        }),
                      );
                    }}
                    // onAdd={() => {
                    //   if (rootNode.type !== 'noyaCompositeElement') return;

                    //   const newSelection: NoyaCompositeElement = {
                    //     ...rootNode,
                    //     diff: resetRemovedClassName(
                    //       rootNode.diff,
                    //       path.slice(1),
                    //       value,
                    //     ),
                    //   };

                    //   setDiff(newSelection);
                    // }}
                  >
                    {value}
                  </Chip>
                );
              })}
              <Chip
                size={'small'}
                addable
                monospace
                colorScheme={selected ? 'primary' : undefined}
                onAdd={() => {
                  if (isSearchingStyles) {
                    setIsSearchingStyles(false);
                  } else {
                    setIsSearchingStyles(true);
                  }
                }}
              />
            </Stack.H>
          )}
          {node.type === 'noyaPrimitiveElement' &&
            node.props.length > 0 &&
            node.props.map((prop) => {
              return (
                <InputField.Root
                  key={prop.id}
                  labelPosition="end"
                  labelSize={60}
                  size="small"
                >
                  <InputField.Input
                    value={
                      prop.type === 'generator'
                        ? prop.generator === 'geometric'
                          ? ''
                          : prop.query
                        : prop.value.toString()
                    }
                    allowSubmittingWithSameValue
                    disabled={
                      prop.type === 'generator' &&
                      prop.generator === 'geometric'
                    }
                    submitAutomaticallyAfterDelay={
                      prop.type === 'generator' ? 300 : 100
                    }
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onSubmit={(value) => {
                      onChange(
                        ResolvedHierarchy.replace(resolvedNode, {
                          at: indexPath,
                          node: {
                            ...node,
                            props: node.props.map((p) => {
                              if (
                                p.name === prop.name &&
                                p.type === 'generator' &&
                                prop.type === 'generator' &&
                                p.generator === prop.generator
                              ) {
                                return { ...p, query: value };
                              }

                              if (
                                p.name === prop.name &&
                                p.type === 'string' &&
                                prop.type === 'string'
                              ) {
                                return { ...p, value };
                              }

                              if (
                                p.name === prop.name &&
                                p.type === 'number' &&
                                prop.type === 'number'
                              ) {
                                const parsed = parseFloat(value);

                                return {
                                  ...p,
                                  value: Number.isFinite(parsed)
                                    ? parsed
                                    : p.value,
                                };
                              }

                              return p;
                            }),
                          },
                        }),
                      );
                    }}
                  />
                  <InputField.Label>
                    {prop.type === 'generator'
                      ? `${
                          prop.generator === 'geometric'
                            ? 'Geometric Pattern'
                            : prop.generator === 'random-icon'
                            ? 'Iconify'
                            : 'Unsplash Stock Photo'
                        }\u00A0\u00A0`
                      : prop.name}
                  </InputField.Label>
                  {prop.type === 'generator' && (
                    <InputField.DropdownMenu
                      items={createSectionedMenu(
                        [
                          (prop.generator === 'random-image' ||
                            prop.generator === 'geometric') && {
                            value: 'shuffle',
                            title: 'Shuffle',
                            icon: <ShuffleIcon />,
                          },
                          prop.generator === 'geometric' && {
                            value: 'configure',
                            title: 'Configure',
                            icon: <MixerHorizontalIcon />,
                          },
                          prop.generator === 'geometric' && {
                            value: 'exportSVG',
                            title: 'Export SVG',
                            icon: <DownloadIcon />,
                          },
                          prop.generator === 'geometric' && {
                            value: 'exportPNG',
                            title: 'Export PNG',
                            icon: <DownloadIcon />,
                          },
                        ],
                        [
                          {
                            value: 'image-url',
                            title: 'Switch to Image URL',
                            icon: <Link1Icon />,
                          },
                          prop.generator !== 'random-icon' && {
                            value: 'random-icon',
                            title: 'Switch to Icon',
                            icon: <VercelLogoIcon />,
                          },
                          prop.generator !== 'random-image' && {
                            value: 'random-image',
                            title: 'Switch to Stock Photo',
                            icon: <ImageIcon />,
                          },
                          prop.generator !== 'geometric' && {
                            value: 'geometric',
                            title: 'Switch to Geometric Pattern',
                            icon: <BoxModelIcon />,
                          },
                        ],
                        [
                          prop.generator !== 'geometric' && {
                            value: 'fetch',
                            title: 'Fetch',
                            icon: <GlobeIcon />,
                          },
                        ],
                      )}
                      onSelect={async (value) => {
                        switch (value) {
                          case 'configure':
                            onConfigureProp?.({
                              path,
                              prop: prop.name,
                            });
                            break;
                          case 'exportSVG': {
                            if (!dsConfig || prop.generator !== 'geometric')
                              return;

                            const svgBlob = createSVGBlob(prop, dsConfig);
                            downloadBlob(svgBlob, 'pattern.svg');
                            break;
                          }
                          case 'exportPNG': {
                            if (!dsConfig || prop.generator !== 'geometric')
                              return;

                            const svgBlob = createSVGBlob(prop, dsConfig);
                            const svgUrl = URL.createObjectURL(svgBlob);

                            // Render svg on canvas
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const img = new Image();
                            img.onload = () => {
                              canvas.width = img.width;
                              canvas.height = img.height;
                              ctx?.drawImage(img, 0, 0);
                              canvas.toBlob((blob) => {
                                if (!blob) return;
                                downloadBlob(blob, 'pattern.png');
                              });
                            };
                            img.src = svgUrl;
                            break;
                          }
                          case 'fetch': {
                            switch (prop.generator) {
                              case 'random-image':
                                break;
                              case 'random-icon':
                                const data =
                                  await client.networkClient.random.icon({
                                    query: prop.query,
                                    preferredCollection: 'heroicons',
                                  });

                                if (data.icons.length === 0) return;

                                const icon = data.icons[0];

                                const iconResponse = await fetch(icon);
                                const svg = await iconResponse.text();

                                onChange(
                                  ResolvedHierarchy.replace(resolvedNode, {
                                    at: indexPath,
                                    node: {
                                      ...node,
                                      props: node.props.map((p) =>
                                        p.name === prop.name &&
                                        p.type === 'generator' &&
                                        p.generator === prop.generator
                                          ? {
                                              ...p,
                                              result: svg,
                                              resolvedQuery: prop.query,
                                            }
                                          : p,
                                      ),
                                    },
                                  }),
                                );
                                break;
                            }

                            break;
                          }
                          case 'image-url': {
                            onChange(
                              ResolvedHierarchy.replace(resolvedNode, {
                                at: indexPath,
                                node: {
                                  ...node,
                                  props: node.props.map((p) =>
                                    p.name === prop.name
                                      ? {
                                          ...p,
                                          type: 'string',
                                          value: '',
                                        }
                                      : p,
                                  ),
                                },
                              }),
                            );
                            break;
                          }
                          case 'geometric':
                          case 'random-image':
                          case 'random-icon': {
                            onChange(
                              ResolvedHierarchy.replace(resolvedNode, {
                                at: indexPath,
                                node: {
                                  ...node,
                                  props: node.props.map((p) =>
                                    p.name === prop.name &&
                                    p.type === 'generator' &&
                                    p.generator === prop.generator
                                      ? {
                                          ...p,
                                          generator: value,
                                          query: '',
                                          result: undefined,
                                          resolvedQuery: undefined,
                                        }
                                      : p,
                                  ),
                                },
                              }),
                            );
                            break;
                          }
                          case 'shuffle': {
                            switch (prop.generator) {
                              case 'random-image':
                                client.random.resetImage({
                                  id: prop.id,
                                  query: prop.query,
                                });
                                break;
                              case 'random-icon':
                                client.random.resetIcon({
                                  id: prop.id,
                                  query: prop.query,
                                });
                                break;
                            }

                            onChange(
                              ResolvedHierarchy.replace(resolvedNode, {
                                at: indexPath,
                                node: {
                                  ...node,
                                  props: node.props.map((p) =>
                                    p.name === prop.name &&
                                    p.type === 'generator' &&
                                    p.generator === prop.generator
                                      ? {
                                          ...p,
                                          query:
                                            prop.generator === 'geometric'
                                              ? randomSeed()
                                              : p.query,
                                          result: undefined,
                                          resolvedQuery: undefined,
                                          data: undefined,
                                        }
                                      : p,
                                  ),
                                },
                              }),
                            );
                            break;
                          }
                        }
                      }}
                    >
                      <PropDropdown prop={prop} hovered={hovered} />
                    </InputField.DropdownMenu>
                  )}
                  {prop.type === 'string' && prop.name === 'src' && (
                    <InputField.DropdownMenu
                      items={createSectionedMenu(
                        [
                          {
                            value: 'upload',
                            title: 'Upload',
                            icon: <UploadIcon />,
                          },
                        ],
                        [
                          {
                            value: 'generator',
                            title: 'Switch to Image Generator',
                            icon: <Link1Icon />,
                          },
                        ],
                      )}
                      onSelect={async (value) => {
                        switch (value) {
                          case 'upload': {
                            if (!uploadAsset) return;
                            const file = await fileOpen();
                            const buffer = await file.arrayBuffer();
                            const url = await uploadAsset(buffer);
                            onChange(
                              ResolvedHierarchy.replace(resolvedNode, {
                                at: indexPath,
                                node: {
                                  ...node,
                                  props: node.props.map((p) =>
                                    p.name === prop.name
                                      ? {
                                          ...p,
                                          type: 'string',
                                          value: url,
                                        }
                                      : p,
                                  ),
                                },
                              }),
                            );
                            break;
                          }
                          case 'generator': {
                            onChange(
                              ResolvedHierarchy.replace(resolvedNode, {
                                at: indexPath,
                                node: {
                                  ...node,
                                  props: node.props.map((p) =>
                                    p.name === prop.name
                                      ? {
                                          ...p,
                                          type: 'generator',
                                          generator: 'random-image',
                                          query: '',
                                          result: undefined,
                                          resolvedQuery: undefined,
                                        }
                                      : p,
                                  ),
                                },
                              }),
                            );
                            break;
                          }
                        }
                      }}
                    >
                      <PropDropdown prop={prop} hovered={hovered} />
                    </InputField.DropdownMenu>
                  )}
                </InputField.Root>
              );
            })}
        </Stack.V>
      </TreeView.Row>
    );
  }),
);

const PropDropdown = forwardRef(function PropDropdown(
  {
    prop,
    hovered,
    ...rest
  }: {
    prop: NoyaProp;
    hovered: boolean;
  },
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      style={{
        position: 'relative',
        top: '1px',
        right: '1px',
        height: '15px',
        width: '15px',
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius: '4px',
        marginLeft: '4px',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      {...rest}
    >
      {prop.type === 'generator' && prop.generator === 'geometric' ? (
        <BoxModelIcon color="#aaa" />
      ) : prop.type === 'generator' && prop.result?.startsWith('<svg') ? (
        svgToReactElement(prop.result)
      ) : (
        <img
          src={
            prop.type === 'generator'
              ? prop.result ?? ''
              : prop.type === 'string'
              ? prop.value
              : undefined
          }
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '4px',
          }}
        />
      )}
      {hovered && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              height: '100%',
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }}
          />
          <CaretDownIcon
            color="white"
            style={{
              position: 'relative',
            }}
          />
        </>
      )}
    </div>
  );
});

function handleMoveItem(
  root: NoyaResolvedNode,
  position: RelativeDropPosition,
  sourceIndexPath: number[],
  destinationIndexPath: number[],
) {
  function inner() {
    switch (position) {
      case 'above': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: destinationIndexPath,
        });
      }
      case 'below': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: [
            ...destinationIndexPath.slice(0, -1),
            destinationIndexPath.at(-1)! + 1,
          ],
        });
      }
      case 'inside': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: [...destinationIndexPath, 1000],
        });
      }
    }
  }

  return inner();
}

function createSVGBlob(prop: NoyaGeneratorProp, dsConfig: DS['config']) {
  const theme: Theme = {
    colorMode: dsConfig.colorMode ?? 'light',
    colors: {
      primary: (tailwindColors as any)[dsConfig.colors.primary],
      neutral: tailwindColors.slate,
    },
  };

  const pattern = createSVG(prop.data, theme.colors);
  const blob = new Blob([pattern], {
    type: 'image/svg+xml',
  });
  return blob;
}
