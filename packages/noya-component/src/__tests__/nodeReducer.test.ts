import { IndexPath } from 'tree-visit';
import { applySelectionDiff } from '../applyDiff';
import { added } from '../arrayDiff';
import { Model } from '../builders';
import { resolvedNodeReducer } from '../nodeReducer';
import { ResolvedHierarchy } from '../resolvedHierarchy';
import {
  createResolvedNode,
  createSelectionWithDiff,
  instantiateResolvedComponent,
  unresolve,
} from '../traversal';
import {
  NoyaResolvedCompositeElement,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
  NoyaResolvedString,
} from '../types';
import { MockState } from './MockState';

function updateStateWithNewResolvedNode({
  state,
  componentID,
  newResolvedNode,
  debug,
}: {
  state: MockState;
  componentID: string;
  newResolvedNode: NoyaResolvedNode;
  debug?: boolean;
}) {
  const selectionWithDiff = createSelectionWithDiff({
    selection: { componentID },
    findComponent: state.findComponent,
    newResolvedNode: newResolvedNode,
    debug,
  });

  const newSelection = applySelectionDiff({
    selection: selectionWithDiff,
    component: state.findComponent(componentID)!,
    enforceSchema: (node) => node,
    enforceSchemaInDiff: (diff) => diff,
    findComponent: state.findComponent,
    debug,
  });

  const newState = state.clonedStateWithComponent(newSelection.component);
  const newRoot = instantiateResolvedComponent(
    newState.findComponent,
    { componentID },
    debug,
  );

  if (debug) {
    // console.log(ResolvedHierarchy.diagram(newRoot));
  }

  return {
    selectionWithDiff,
    newSelection,
    newRoot,
    newState,
  };
}

function createSimpleBox() {
  const state = new MockState();

  const basicComponent = state.addComponent({
    componentID: 'custom',
    rootElement: Model.primitiveElement('box'),
  });

  const element = Model.compositeElement(basicComponent.componentID);

  return {
    resolvedNode: state.createResolvedNode(element),
  };
}

function classNamesAtIndexPath(
  resolvedNode: NoyaResolvedNode,
  indexPath: IndexPath,
) {
  const node = ResolvedHierarchy.access(resolvedNode, indexPath);

  if (node.type !== 'noyaPrimitiveElement') {
    throw new Error('Expected primitive element');
  }

  return node.classNames.map((c) => c.value);
}

it('adds class name', () => {
  let { resolvedNode } = createSimpleBox();

  expect(classNamesAtIndexPath(resolvedNode, [0])).toEqual([]);

  resolvedNode = resolvedNodeReducer(resolvedNode, {
    type: 'addClassNames',
    indexPath: [0],
    classNames: ['foo'],
  });

  expect(classNamesAtIndexPath(resolvedNode, [0])).toEqual(['foo']);
});

it('removes class name', () => {
  let { resolvedNode } = createSimpleBox();

  expect(classNamesAtIndexPath(resolvedNode, [0])).toEqual([]);

  resolvedNode = resolvedNodeReducer(resolvedNode, {
    type: 'addClassNames',
    indexPath: [0],
    classNames: ['foo'],
  });

  expect(classNamesAtIndexPath(resolvedNode, [0])).toEqual(['foo']);

  resolvedNode = resolvedNodeReducer(resolvedNode, {
    type: 'removeClassNames',
    indexPath: [0],
    classNames: ['foo'],
  });

  expect(classNamesAtIndexPath(resolvedNode, [0])).toEqual([]);
});

it('sets name', () => {
  let { resolvedNode } = createSimpleBox();

  expect(ResolvedHierarchy.access(resolvedNode, [0]).name).toEqual(undefined);

  resolvedNode = resolvedNodeReducer(resolvedNode, {
    type: 'setName',
    indexPath: [0],
    name: 'foo',
  });

  expect(ResolvedHierarchy.access(resolvedNode, [0]).name).toEqual('foo');
});

it('sets text value', () => {
  const state = new MockState();

  const component = state.addComponent({
    componentID: 'custom',
    rootElement: Model.primitiveElement({
      componentID: 'text',
      children: [Model.string({ name: 'String', value: 'Hello' })],
    }),
  });

  let resolvedNode = state.instantiateComponent(component.componentID);

  resolvedNode = resolvedNodeReducer(resolvedNode, {
    type: 'setTextValue',
    indexPath: [0],
    textValue: 'World',
  });

  expect(
    ResolvedHierarchy.find<NoyaResolvedString>(
      resolvedNode,
      (node): node is NoyaResolvedString =>
        node.type === 'noyaString' && node.name === 'String',
    )?.value,
  ).toEqual('World');
});

describe('nested layout', () => {
  const state = new MockState();

  const component2 = state.addComponent({
    name: 'Component2',
    componentID: 'c2',
    rootElement: Model.primitiveElement({
      name: 'Primitive2',
      componentID: 'box',
    }),
  });

  const component1 = state.addComponent({
    name: 'Component1',
    componentID: 'c1',
    rootElement: Model.primitiveElement({
      name: 'Primitive1',
      componentID: 'box',
      children: [
        Model.compositeElement({
          name: 'InstanceOf2',
          componentID: component2.componentID,
        }),
      ],
    }),
  });

  const root = instantiateResolvedComponent(state.findComponent, {
    componentID: component1.componentID,
  });

  const resolvedPrimitive2 = ResolvedHierarchy.find(
    root,
    (node) => node.name === 'Primitive2',
  ) as NoyaResolvedPrimitiveElement;

  const primitive2IndexPath = ResolvedHierarchy.indexPathOfNode(
    root,
    resolvedPrimitive2,
  )!;

  it('adds classname', () => {
    expect(classNamesAtIndexPath(root, primitive2IndexPath)).toEqual([]);

    const updated = resolvedNodeReducer(root, {
      type: 'addClassNames',
      indexPath: ResolvedHierarchy.indexPathOfNode(root, resolvedPrimitive2)!,
      classNames: ['foo'],
    });

    expect(classNamesAtIndexPath(updated, primitive2IndexPath)).toEqual([
      'foo',
    ]);

    const { newRoot } = updateStateWithNewResolvedNode({
      state,
      componentID: component1.componentID,
      newResolvedNode: updated,
    });

    expect(classNamesAtIndexPath(newRoot, primitive2IndexPath)).toEqual([
      'foo',
    ]);
  });

  it('adds child', () => {
    expect(
      (
        ResolvedHierarchy.access(
          root,
          primitive2IndexPath,
        ) as NoyaResolvedPrimitiveElement
      ).children,
    ).toHaveLength(0);

    const updated = resolvedNodeReducer(root, {
      type: 'insertNode',
      indexPath: primitive2IndexPath,
      node: createResolvedNode({
        findComponent: state.findComponent,
        node: Model.primitiveElement({ name: 'Avatar', componentID: 'avatar' }),
      }),
    });

    expect(
      (
        ResolvedHierarchy.access(
          updated,
          primitive2IndexPath,
        ) as NoyaResolvedPrimitiveElement
      ).children,
    ).toHaveLength(1);

    const { newRoot } = updateStateWithNewResolvedNode({
      state,
      componentID: component1.componentID,
      newResolvedNode: updated,
    });

    expect(
      (
        ResolvedHierarchy.access(
          newRoot,
          primitive2IndexPath,
        ) as NoyaResolvedPrimitiveElement
      ).children,
    ).toHaveLength(1);

    // Now add a classname to the new avatar child
    const avatarIndexPath = ResolvedHierarchy.findIndexPath(
      newRoot,
      (node) => node.name === 'Avatar',
    )!;

    expect(classNamesAtIndexPath(updated, avatarIndexPath)).toEqual([]);

    const updated2 = resolvedNodeReducer(newRoot, {
      type: 'addClassNames',
      indexPath: avatarIndexPath,
      classNames: ['foo'],
    });

    expect(classNamesAtIndexPath(updated2, avatarIndexPath)).toEqual(['foo']);

    const { newRoot: newRoot2 } = updateStateWithNewResolvedNode({
      state,
      componentID: component1.componentID,
      newResolvedNode: updated2,
    });

    expect(classNamesAtIndexPath(newRoot2, avatarIndexPath)).toEqual(['foo']);
  });
});

describe('doubly nested layout', () => {
  const state = new MockState();

  const component3 = state.addComponent({
    name: 'Component3',
    componentID: 'c3',
    rootElement: Model.primitiveElement({
      name: 'Primitive3',
      componentID: 'box',
    }),
  });

  const component2 = state.addComponent({
    name: 'Component2',
    componentID: 'c2',
    rootElement: Model.primitiveElement({
      name: 'Primitive2',
      componentID: 'box',
      children: [
        Model.compositeElement({
          name: 'InstanceOf3',
          componentID: component3.componentID,
        }),
      ],
    }),
  });

  const component1 = state.addComponent({
    name: 'Component1',
    componentID: 'c1',
    rootElement: Model.primitiveElement({
      name: 'Primitive1',
      componentID: 'box',
      children: [
        Model.compositeElement({
          name: 'InstanceOf2',
          componentID: component2.componentID,
        }),
      ],
    }),
  });

  const root = instantiateResolvedComponent(state.findComponent, {
    componentID: component1.componentID,
  });

  const resolvedPrimitive3 = ResolvedHierarchy.find(
    root,
    (node) => node.name === 'Primitive3',
  ) as NoyaResolvedPrimitiveElement;

  const primitive3IndexPath = ResolvedHierarchy.indexPathOfNode(
    root,
    resolvedPrimitive3,
  )!;

  it('adds classname to innermost', () => {
    expect(resolvedPrimitive3.classNames).toEqual([]);

    const updated = resolvedNodeReducer(root, {
      type: 'addClassNames',
      indexPath: primitive3IndexPath,
      classNames: ['foo'],
    });

    expect(classNamesAtIndexPath(updated, primitive3IndexPath)).toEqual([
      'foo',
    ]);

    const { newRoot } = updateStateWithNewResolvedNode({
      state,
      componentID: component1.componentID,
      newResolvedNode: updated,
    });

    expect(classNamesAtIndexPath(newRoot, primitive3IndexPath)).toEqual([
      'foo',
    ]);
  });

  it('adds child to innermost', () => {
    expect(
      (
        ResolvedHierarchy.access(
          root,
          primitive3IndexPath,
        ) as NoyaResolvedPrimitiveElement
      ).children,
    ).toHaveLength(0);

    const updated = resolvedNodeReducer(root, {
      type: 'insertNode',
      indexPath: primitive3IndexPath,
      node: createResolvedNode({
        findComponent: state.findComponent,
        node: Model.primitiveElement({ name: 'Avatar', componentID: 'avatar' }),
      }),
    });

    expect(
      (
        ResolvedHierarchy.access(
          updated,
          primitive3IndexPath,
        ) as NoyaResolvedPrimitiveElement
      ).children,
    ).toHaveLength(1);

    const { newRoot } = updateStateWithNewResolvedNode({
      state,
      componentID: component1.componentID,
      newResolvedNode: updated,
    });

    expect(
      (
        ResolvedHierarchy.access(
          newRoot,
          primitive3IndexPath,
        ) as NoyaResolvedPrimitiveElement
      ).children,
    ).toHaveLength(1);

    // Now add a classname to the new avatar child
    const avatarIndexPath = ResolvedHierarchy.findIndexPath(
      newRoot,
      (node) => node.name === 'Avatar',
    )!;

    expect(classNamesAtIndexPath(updated, avatarIndexPath)).toEqual([]);

    const updated2 = resolvedNodeReducer(newRoot, {
      type: 'addClassNames',
      indexPath: avatarIndexPath,
      classNames: ['foo'],
    });

    expect(classNamesAtIndexPath(updated2, avatarIndexPath)).toEqual(['foo']);

    const { newRoot: newRoot2 } = updateStateWithNewResolvedNode({
      state,
      componentID: component1.componentID,
      newResolvedNode: updated2,
    });

    expect(classNamesAtIndexPath(newRoot2, avatarIndexPath)).toEqual(['foo']);
  });
});

describe('add component within layout', () => {
  it('adds component within layout', () => {
    const state = new MockState();

    const flexLayout = state.addComponent({
      name: 'FlexLayout',
      componentID: 'f',
      rootElement: Model.primitiveElement({
        name: 'FlexPrimitive',
        componentID: 'box',
      }),
    });

    const gridLayout = state.addComponent({
      name: 'GridLayout',
      componentID: 'g',
      rootElement: Model.primitiveElement({
        name: 'GridPrimitive',
        componentID: 'box',
        children: [
          Model.primitiveElement({
            name: 'Avatar',
            componentID: 'avatar',
          }),
        ],
      }),
    });

    const section = state.addComponent({
      name: 'SectionLayout',
      componentID: 's',
      rootElement: Model.primitiveElement({
        name: 'SectionPrimitive',
        componentID: 'box',
      }),
    });

    const root = instantiateResolvedComponent(state.findComponent, {
      componentID: section.componentID,
    });

    const resolvedSection = ResolvedHierarchy.find(
      root,
      (node) => node.name === 'SectionPrimitive',
    ) as NoyaResolvedPrimitiveElement;

    const flexLayoutInstance = createResolvedNode({
      findComponent: state.findComponent,
      node: Model.compositeElement({
        name: 'InsertedFlexLayout',
        componentID: flexLayout.componentID,
      }),
    });

    // Add a flex layout to the section
    const rootWithFlex = resolvedNodeReducer(root, {
      type: 'insertNode',
      indexPath: ResolvedHierarchy.indexPathOfNode(root, resolvedSection)!,
      node: flexLayoutInstance,
    });

    // Save change to state
    const { newRoot, newState, selectionWithDiff } =
      updateStateWithNewResolvedNode({
        state,
        componentID: section.componentID,
        newResolvedNode: rootWithFlex,
      });

    // Diff should add the flex layout
    expect(selectionWithDiff.diff?.items).toEqual([
      Model.diffItem({
        id: selectionWithDiff.diff?.items[0].id,
        path: [root.id],
        children: [added(unresolve(flexLayoutInstance))],
      }),
    ]);

    // Test that the flex layout was added
    const resolvedFlex = ResolvedHierarchy.find(
      newRoot,
      (node) => node.name === 'FlexPrimitive',
    ) as NoyaResolvedPrimitiveElement;
    expect(resolvedFlex).toBeTruthy();

    // Add a grid layout within the flex layout
    const rootWithGrid = resolvedNodeReducer(newRoot, {
      type: 'insertNode',
      indexPath: ResolvedHierarchy.indexPathOfNode(newRoot, resolvedFlex)!,
      node: createResolvedNode({
        findComponent: state.findComponent,
        node: Model.compositeElement({
          name: 'InsertedGridLayout',
          componentID: gridLayout.componentID,
        }),
      }),
    });

    // Test that the grid layout was added
    expect(
      ResolvedHierarchy.find(
        rootWithGrid,
        (node) => node.name === 'InsertedGridLayout',
      ),
    ).toBeTruthy();

    // Save change to state
    const {
      newState: newState2,
      newRoot: newRoot2,
      selectionWithDiff: selectionWithDiff2,
    } = updateStateWithNewResolvedNode({
      state: newState,
      componentID: section.componentID,
      newResolvedNode: rootWithGrid,
    });

    // Test that the grid layout was added
    const resolvedGrid = ResolvedHierarchy.find(
      newRoot2,
      (node) => node.name === 'InsertedGridLayout',
    )!;
    expect(resolvedGrid).toBeTruthy();

    // Diff should add the grid layout
    expect(selectionWithDiff2.diff?.items).toEqual([
      Model.diffItem({
        id: selectionWithDiff2.diff?.items[0].id,
        path: ResolvedHierarchy.keyPathOfNode(
          newRoot2,
          ResolvedHierarchy.find(
            newRoot2,
            (node) => node.name === 'FlexPrimitive',
          )!,
        )!,
        children: [added(unresolve(resolvedGrid))],
      }),
    ]);

    // Diff path should collapse into the flex layout
    const insertedFlexLayout = ResolvedHierarchy.find(
      newRoot2,
      (node) => node.name === 'InsertedFlexLayout',
    ) as NoyaResolvedCompositeElement;
    expect(insertedFlexLayout.diff?.items).toEqual([
      Model.diffItem({
        id: insertedFlexLayout.diff?.items[0].id,
        path: [resolvedFlex.id],
        children: [added(unresolve(resolvedGrid))],
      }),
    ]);

    // Add a class name to the grid layout
    const rootWithClassName = resolvedNodeReducer(newRoot2, {
      type: 'addClassNames',
      indexPath: ResolvedHierarchy.findIndexPath(
        newRoot2,
        (n) => n.name === 'GridPrimitive',
      )!,
      classNames: ['foo'],
    });

    // Save change to state
    const {
      newState: newState3,
      newRoot: newRoot3,
      // selectionWithDiff: selectionWithDiff3,
    } = updateStateWithNewResolvedNode({
      state: newState2,
      componentID: section.componentID,
      newResolvedNode: rootWithClassName,
      // debug: true,
    });

    // console.log(JSON.stringify(selectionWithDiff3.diff, null, 2));
    // console.log(ResolvedHierarchy.diagram(rootWithClassName));
    // console.log(ResolvedHierarchy.diagram(newRoot3));

    // Test that class name was added
    expect(
      classNamesAtIndexPath(
        newRoot3,
        ResolvedHierarchy.findIndexPath(
          newRoot3,
          (n) => n.name === 'GridPrimitive',
        )!,
      ),
    ).toEqual(['foo']);

    // Add classname to avatar
    const rootWithAvatarClassName = resolvedNodeReducer(newRoot3, {
      type: 'addClassNames',
      indexPath: ResolvedHierarchy.findIndexPath(
        newRoot3,
        (n) => n.name === 'Avatar',
      )!,
      classNames: ['bar'],
    });

    // Save change to state
    const {
      // newState: newState4,
      newRoot: newRoot4,
      // selectionWithDiff: selectionWithDiff4,
    } = updateStateWithNewResolvedNode({
      state: newState3,
      componentID: section.componentID,
      newResolvedNode: rootWithAvatarClassName,
      // debug: true,
    });

    // Test that class name was added
    expect(
      classNamesAtIndexPath(
        newRoot4,
        ResolvedHierarchy.findIndexPath(newRoot4, (n) => n.name === 'Avatar')!,
      ),
    ).toEqual(['bar']);
  });
});
