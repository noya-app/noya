import { IndexPath } from 'tree-visit';
import { Model } from '../builders';
import { resolvedNodeReducer } from '../nodeReducer';
import { ResolvedHierarchy } from '../resolvedHierarchy';
import { createResolvedNode } from '../traversal';
import { NoyaResolvedNode } from '../types';

function createSimpleBox() {
  const component = Model.component({
    componentID: 'custom',
    rootElement: Model.primitiveElement('box'),
  });

  const components = {
    [component.componentID]: component,
  };

  const element = Model.compositeElement({
    componentID: component.componentID,
  });

  return {
    resolvedNode: createResolvedNode(
      (componentID) => components[componentID],
      element,
    ),
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
