import { IndexPath } from 'tree-visit';
import { applyDiff } from '../applyDiff';
import { Model } from '../builders';
import { resolvedNodeReducer } from '../nodeReducer';
import { ResolvedHierarchy } from '../resolvedHierarchy';
import {
  createResolvedNode,
  instantiateResolvedComponent,
  updateSelection,
} from '../traversal';
import {
  NoyaComponent,
  NoyaNode,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
} from '../types';

class MockState {
  components: Record<string, NoyaComponent> = {};

  findComponent = (componentID: string) => {
    return this.components[componentID];
  };

  createResolvedNode(element: NoyaNode) {
    return createResolvedNode(this.findComponent, element);
  }

  addComponent(options: Parameters<typeof Model.component>[0]) {
    const component = Model.component(options);
    this.components[component.componentID] = component;
    return component;
  }

  clonedStateWithComponent(component: NoyaComponent) {
    const state = new MockState();
    state.components = {
      ...this.components,
      [component.componentID]: component,
    };
    return state;
  }
}

function updateStateWithNewResolvedNode({
  state,
  componentID,
  newResolvedNode,
}: {
  state: MockState;
  componentID: string;
  newResolvedNode: NoyaResolvedNode;
}) {
  const updatedSelection = updateSelection({
    selection: { componentID },
    findComponent: state.findComponent,
    newResolvedNode: newResolvedNode,
  });

  const appliedSelection = applyDiff({
    selection: updatedSelection,
    component: state.findComponent(componentID)!,
    enforceSchema: (node) => node,
    findComponent: state.findComponent,
  });

  const newState = state.clonedStateWithComponent(appliedSelection.component);
  const newRoot = instantiateResolvedComponent(newState.findComponent, {
    componentID,
  });

  return {
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
      node: createResolvedNode(
        state.findComponent,
        Model.primitiveElement({ name: 'Avatar', componentID: 'avatar' }),
      ),
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
      node: createResolvedNode(
        state.findComponent,
        Model.primitiveElement({ name: 'Avatar', componentID: 'avatar' }),
      ),
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
