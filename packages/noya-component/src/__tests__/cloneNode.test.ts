import { Model } from '../builders';
import { resolvedNodeReducer } from '../nodeReducer';
import { ResolvedHierarchy } from '../resolvedHierarchy';
import { NoyaResolvedCompositeElement } from '../types';
import { MockState } from './MockState';

function idGenerator() {
  let id = 0;

  return () => {
    return String(id++);
  };
}

it('clones a primitive node', () => {
  const state = new MockState();
  const node = Model.primitiveElement('box');
  const resolvedNode = state.createResolvedNode(node);
  const clonedNode = ResolvedHierarchy.clone(resolvedNode, {
    uuid: idGenerator(),
  });

  expect(clonedNode.id).toEqual('0');
});

it('clones a composite node', () => {
  const state = new MockState();
  const component = state.addComponent({
    componentID: 'hero',
    rootElement: Model.primitiveElement('box'),
  });

  const node = Model.compositeElement({
    componentID: component.componentID,
  });

  const resolvedNode = state.createResolvedNode(node);
  const clonedNode = ResolvedHierarchy.clone(resolvedNode, {
    uuid: idGenerator(),
  });

  expect(clonedNode.id).toEqual('1');
  expect(ResolvedHierarchy.access(clonedNode, [0])?.id).toEqual('0');
});

it('clones a composite node with a diff', () => {
  const state = new MockState();
  const inner = state.addComponent({
    componentID: 'hero',
    rootElement: Model.primitiveElement({
      id: 'b',
      componentID: 'box',
      children: [
        Model.primitiveElement({ name: 'Avatar', componentID: 'avatar' }),
      ],
    }),
  });

  const outer = state.addComponent({
    componentID: 'layout',
    rootElement: Model.compositeElement(inner.componentID),
  });

  const resolvedNode = state.instantiateComponent(outer.componentID);

  const updated = resolvedNodeReducer(resolvedNode, {
    type: 'addClassNames',
    indexPath: ResolvedHierarchy.findIndexPath(
      resolvedNode,
      (n) => n.name === 'Avatar',
    )!,
    classNames: ['foo'],
  });

  const { newRoot } = state.updateWithNewResolvedNode({
    componentID: outer.componentID,
    newResolvedNode: updated,
  });

  // expect diff path to match avatar path
  expect(
    ResolvedHierarchy.findKeyPath(
      (newRoot as NoyaResolvedCompositeElement).rootElement,
      (n) => n.name === 'Avatar',
    )?.join('/'),
  ).toEqual(
    (newRoot as NoyaResolvedCompositeElement).diff?.items[0].path.join('/'),
  );

  const clonedNode = ResolvedHierarchy.clone(newRoot, {
    uuid: idGenerator(),
  });

  expect(
    ResolvedHierarchy.findKeyPath(
      (clonedNode as NoyaResolvedCompositeElement).rootElement,
      (n) => n.name === 'Avatar',
    )?.join('/'),
  ).toEqual(
    (clonedNode as NoyaResolvedCompositeElement).diff?.items[0].path.join('/'),
  );
});
