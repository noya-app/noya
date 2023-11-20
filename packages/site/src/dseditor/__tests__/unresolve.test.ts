import { added } from 'noya-component';
import { Model } from '../builders';
import { createResolvedNode, unresolve } from '../traversal';

it('unresolves string', () => {
  const node = Model.string('Hello');

  const resolvedNode = createResolvedNode(() => undefined, node);

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves primitive', () => {
  const node = Model.primitiveElement('box');

  const resolvedNode = createResolvedNode(() => undefined, node);

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves component', () => {
  const component = Model.component({
    componentID: 'hero',
    rootElement: Model.primitiveElement('box'),
  });

  const components = {
    [component.componentID]: component,
  };

  const node = Model.compositeElement({
    componentID: component.componentID,
  });

  const resolvedNode = createResolvedNode(
    (componentID) => components[componentID],
    node,
  );

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves component with diff', () => {
  const component = Model.component({
    componentID: 'hero',
    rootElement: Model.primitiveElement('box'),
  });

  const components = {
    [component.componentID]: component,
  };

  const node = Model.compositeElement({
    componentID: component.componentID,
    diff: Model.diff([
      Model.diffItem({
        path: [component.rootElement.id],
        children: [added(Model.string('Hello'), 0)],
      }),
    ]),
  });

  const resolvedNode = createResolvedNode(
    (componentID) => components[componentID],
    node,
  );

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});
