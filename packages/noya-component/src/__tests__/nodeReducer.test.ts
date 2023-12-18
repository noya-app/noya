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

it('creates nested layout and adds classname', () => {
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

  // Classnames of Primimitive2 should be empty
  const primitive2 = ResolvedHierarchy.find(
    root,
    (node) => node.name === 'Primitive2',
  ) as NoyaResolvedPrimitiveElement;
  expect(primitive2.classNames).toEqual([]);

  const updated = resolvedNodeReducer(root, {
    type: 'addClassNames',
    indexPath: ResolvedHierarchy.indexPathOfNode(root, primitive2)!,
    classNames: ['foo'],
  });

  expect(
    classNamesAtIndexPath(
      updated,
      ResolvedHierarchy.indexPathOfNode(root, primitive2)!,
    ),
  ).toEqual(['foo']);

  const { newRoot } = updateStateWithNewResolvedNode({
    state,
    componentID: component1.componentID,
    newResolvedNode: updated,
  });

  expect(
    classNamesAtIndexPath(
      newRoot,
      ResolvedHierarchy.indexPathOfNode(root, primitive2)!,
    ),
  ).toEqual(['foo']);
});

it('creates doubly nested layout and adds classname', () => {
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

  // Classnames of Primimitive3 should be empty
  const primitive3 = ResolvedHierarchy.find(
    root,
    (node) => node.name === 'Primitive3',
  ) as NoyaResolvedPrimitiveElement;
  expect(primitive3.classNames).toEqual([]);

  const updated = resolvedNodeReducer(root, {
    type: 'addClassNames',
    indexPath: ResolvedHierarchy.indexPathOfNode(root, primitive3)!,
    classNames: ['foo'],
  });

  expect(
    classNamesAtIndexPath(
      updated,
      ResolvedHierarchy.indexPathOfNode(root, primitive3)!,
    ),
  ).toEqual(['foo']);

  const { newRoot } = updateStateWithNewResolvedNode({
    state,
    componentID: component1.componentID,
    newResolvedNode: updated,
  });

  expect(
    classNamesAtIndexPath(
      newRoot,
      ResolvedHierarchy.indexPathOfNode(root, primitive3)!,
    ),
  ).toEqual(['foo']);
});
