/* eslint-disable jest/no-commented-out-tests */
import {
  Model,
  NoyaPrimitiveElement,
  NoyaResolvedCompositeElement,
  NoyaResolvedPrimitiveElement,
  added,
  createResolvedNode,
  removed,
} from 'noya-component';

const PRIMITIVE_ID = 'p';

const bgBlue = Model.className('bg-blue-500');
const bgRed = Model.className('bg-red-500');
const bgPink = Model.className('bg-pink-500');

describe('resolving', () => {
  it('composite element', () => {
    const component = Model.component({
      componentID: 'a',
      rootElement: Model.primitiveElement({
        componentID: PRIMITIVE_ID,
      }),
    });

    const components = {
      [component.componentID]: component,
    };

    const element = Model.compositeElement({
      componentID: component.componentID,
    });

    const resolvedNode = createResolvedNode(
      (componentID) => components[componentID],
      element,
    ) as NoyaResolvedCompositeElement;

    expect(resolvedNode.id).toEqual(element.id);
    expect(resolvedNode.componentID).toEqual(element.componentID);
    expect(resolvedNode.path).toEqual([element.id]);

    const resolvedChild =
      resolvedNode.rootElement as NoyaResolvedPrimitiveElement;

    expect(resolvedChild.id).toEqual(component.rootElement.id);
    expect(resolvedChild.componentID).toEqual(
      (component.rootElement as NoyaPrimitiveElement).componentID,
    );
    expect(resolvedChild.path).toEqual([element.id, component.rootElement.id]);
  });
});

describe('diffing', () => {
  const redComponent = Model.component({
    componentID: 'a',
    rootElement: Model.primitiveElement({
      componentID: PRIMITIVE_ID,
      classNames: [bgRed],
    }),
  });

  const wrapperComponent = Model.component({
    componentID: 'b',
    rootElement: Model.compositeElement({
      componentID: redComponent.componentID,
      diff: Model.diff([
        Model.diffItem({
          path: [redComponent.rootElement.id],
          classNames: [added(bgPink, 1)],
        }),
      ]),
    }),
  });

  const components = {
    [redComponent.componentID]: redComponent,
    [wrapperComponent.componentID]: wrapperComponent,
  };

  const findComponent = (componentID: string) => components[componentID];

  it('adds class names', () => {
    const element = Model.compositeElement({
      componentID: redComponent.componentID,
      diff: Model.diff([
        Model.diffItem({
          path: [redComponent.rootElement.id],
          classNames: [added(bgBlue, 1)],
        }),
      ]),
    });

    const resolvedNode = createResolvedNode(
      findComponent,
      element,
    ) as NoyaResolvedCompositeElement;

    const resolvedChild =
      resolvedNode.rootElement as NoyaResolvedPrimitiveElement;

    expect(resolvedChild.classNames).toEqual([bgRed, bgBlue]);
  });

  it('adds nested class names', () => {
    const element = Model.compositeElement({
      componentID: wrapperComponent.componentID,
      diff: Model.diff([
        Model.diffItem({
          path: [wrapperComponent.rootElement.id, redComponent.rootElement.id],
          classNames: [added(bgBlue, 2)],
        }),
      ]),
    });

    const resolvedNode = createResolvedNode(
      findComponent,
      element,
    ) as NoyaResolvedCompositeElement;

    const resolvedChild =
      resolvedNode.rootElement as NoyaResolvedCompositeElement;

    const resolvedGrandchild =
      resolvedChild.rootElement as NoyaResolvedPrimitiveElement;

    expect(resolvedGrandchild.classNames).toEqual([bgRed, bgPink, bgBlue]);

    expect(resolvedGrandchild.path).toEqual([
      element.id,
      wrapperComponent.rootElement.id,
      redComponent.rootElement.id,
    ]);
  });

  it('removes class names', () => {
    const element = Model.compositeElement({
      componentID: redComponent.componentID,
      diff: Model.diff([
        Model.diffItem({
          path: [redComponent.rootElement.id],
          classNames: [removed(0)],
        }),
      ]),
    });

    const resolvedNode = createResolvedNode(
      findComponent,
      element,
    ) as NoyaResolvedCompositeElement;

    const resolvedChild =
      resolvedNode.rootElement as NoyaResolvedPrimitiveElement;

    expect(resolvedChild.classNames).toEqual([]);
  });

  // it('embeds class names in primitive', () => {
  //   const primitive = Model.primitiveElement({
  //     componentID: PRIMITIVE_ID,
  //     classNames: ['bg-red-500'],
  //   });

  //   const updated = embedRootLevelDiff(
  //     primitive,
  //     Model.diff([
  //       Model.diffItem({
  //         path: [primitive.id],
  //         classNames: {
  //           add: ['bg-green-500'],
  //         },
  //       }),
  //     ]),
  //   ) as NoyaPrimitiveElement;

  //   expect(updated.classNames).toEqual(['bg-red-500', 'bg-green-500']);
  // });

  // it('embeds nested diff in composite element', () => {
  //   const element = Model.compositeElement({
  //     componentID: wrapperComponent.componentID,
  //     diff: Model.diff([
  //       Model.diffItem({
  //         path: [wrapperComponent.rootElement.id, redComponent.rootElement.id],
  //         classNames: {
  //           add: ['bg-blue-500'],
  //         },
  //       }),
  //     ]),
  //   });

  //   const updated = embedRootLevelDiff(
  //     element,
  //     Model.diff([
  //       Model.diffItem({
  //         path: [
  //           element.id,
  //           wrapperComponent.rootElement.id,
  //           redComponent.rootElement.id,
  //         ],
  //         classNames: {
  //           add: ['bg-green-500'],
  //         },
  //       }),
  //     ]),
  //   ) as NoyaCompositeElement;

  //   expect(updated.diff?.items).toEqual([
  //     {
  //       path: [wrapperComponent.rootElement.id, redComponent.rootElement.id],
  //       classNames: {
  //         add: ['bg-blue-500', 'bg-green-500'],
  //       },
  //     },
  //   ]);

  //   // const updatedChild = updated.rootElement as NoyaResolvedPrimitiveElement;

  //   // expect(updatedChild.classNames).toEqual([
  //   //   { value: 'bg-red-500' },
  //   //   { value: 'bg-blue-500', status: 'added' },
  //   //   { value: 'bg-green-500', status: 'added' },
  //   // ]);
  // });

  // it('embeds string value', () => {
  //   const string = Model.string('hello');

  //   const updated = embedRootLevelDiff(
  //     string,
  //     Model.diff([
  //       Model.diffItem({
  //         path: [string.id],
  //         textValue: 'world',
  //       }),
  //     ]),
  //   ) as NoyaString;

  //   expect(updated.value).toEqual('world');
  // });

  //   describe('children', () => {
  //     it('adds', () => {
  //       const element = Model.compositeElement({
  //         componentID: redComponent.componentID,
  //         diff: Model.diff([
  //           Model.diffItem({
  //             path: [redComponent.rootElement.id],
  //             children: {
  //               add: [
  //                 {
  //                   node: Model.string({ value: 'a', id: 'a' }),
  //                   index: 0,
  //                 },
  //               ],
  //             },
  //           }),
  //         ]),
  //       });

  //       const resolvedNode = createResolvedNode(
  //         findComponent,
  //         element,
  //       ) as NoyaResolvedCompositeElement;

  //       const resolvedChild =
  //         resolvedNode.rootElement as NoyaResolvedPrimitiveElement;

  //       expect(resolvedChild.children.map((child) => child.id)).toEqual(['a']);
  //       expect(resolvedChild.children[0].status).toEqual('added');
  //     });

  //     it('removes', () => {
  //       const componentWithChildren = Model.component({
  //         componentID: 'x',
  //         rootElement: Model.primitiveElement({
  //           componentID: PRIMITIVE_ID,
  //           children: [
  //             Model.string({ value: 'a', id: 'a' }),
  //             Model.string({ value: 'b', id: 'b' }),
  //           ],
  //         }),
  //       });

  //       const element = Model.compositeElement({
  //         componentID: componentWithChildren.componentID,
  //         diff: Model.diff([
  //           Model.diffItem({
  //             path: [componentWithChildren.rootElement.id],
  //             children: {
  //               remove: ['a'],
  //             },
  //           }),
  //         ]),
  //       });

  //       const resolvedNode = createResolvedNode(
  //         (componentID) =>
  //           componentID === componentWithChildren.componentID
  //             ? componentWithChildren
  //             : undefined,
  //         element,
  //         [],
  //         0,
  //       ) as NoyaResolvedCompositeElement;

  //       const resolvedChild =
  //         resolvedNode.rootElement as NoyaResolvedPrimitiveElement;

  //       expect(resolvedChild.children.map((child) => child.id)).toEqual(['b']);

  //       const resolvedNodeWithStatus = createResolvedNode(
  //         (componentID) =>
  //           componentID === componentWithChildren.componentID
  //             ? componentWithChildren
  //             : undefined,
  //         element,
  //         [],
  //         2,
  //       ) as NoyaResolvedCompositeElement;

  //       const resolvedChildWithStatus =
  //         resolvedNodeWithStatus.rootElement as NoyaResolvedPrimitiveElement;

  //       expect(resolvedChildWithStatus.children[0].status).toEqual('removed');
  //       expect(resolvedChildWithStatus.children[1].status).toEqual(undefined);
  //     });
  //   });
  // });

  // describe('find source node', () => {
  //   it('standard', () => {
  //     const component = Model.component({
  //       componentID: 'c1',
  //       rootElement: Model.primitiveElement({
  //         id: 'b',
  //         componentID: 'c2',
  //         children: [
  //           Model.primitiveElement({
  //             id: 'c',
  //             componentID: 'c3',
  //           }),
  //         ],
  //       }),
  //     });

  //     const components = {
  //       [component.componentID]: component,
  //     };

  //     const element = Model.compositeElement({
  //       id: 'a',
  //       componentID: component.componentID,
  //     });

  //     const found = findSourceNode(
  //       (componentID) => components[componentID],
  //       element,
  //       ['a', 'b', 'c'],
  //     );

  //     expect(found?.id).toEqual('c');
  //   });

  //   it('nested', () => {
  //     const component = Model.component({
  //       componentID: 'c1',
  //       rootElement: Model.primitiveElement({
  //         id: 'b',
  //         componentID: 'c2',
  //         children: [
  //           Model.primitiveElement({
  //             id: 'c',
  //             componentID: 'c3',
  //             children: [
  //               Model.primitiveElement({
  //                 id: 'd',
  //                 componentID: 'c4',
  //               }),
  //             ],
  //           }),
  //         ],
  //       }),
  //     });

  //     const components = {
  //       [component.componentID]: component,
  //     };

  //     const element = Model.compositeElement({
  //       id: 'a',
  //       componentID: component.componentID,
  //     });

  //     const found = findSourceNode(
  //       (componentID) => components[componentID],
  //       element,
  //       ['a', 'b', 'c', 'd'],
  //     );

  //     expect(found?.id).toEqual('d');
  //   });

  //   it('inserted', () => {
  //     const component = Model.component({
  //       componentID: 'c1',
  //       rootElement: Model.primitiveElement({
  //         id: 'b',
  //         componentID: 'c2',
  //         children: [
  //           Model.primitiveElement({
  //             id: 'c',
  //             componentID: 'c3',
  //           }),
  //         ],
  //       }),
  //     });

  //     const components = {
  //       [component.componentID]: component,
  //     };

  //     const element = Model.compositeElement({
  //       id: 'a',
  //       componentID: component.componentID,
  //       diff: Model.diff([
  //         Model.diffItem({
  //           path: ['b'],
  //           children: {
  //             add: [
  //               {
  //                 node: Model.string({ value: 'd', id: 'd' }),
  //                 index: 1,
  //               },
  //             ],
  //           },
  //         }),
  //       ]),
  //     });

  //     const found = findSourceNode(
  //       (componentID) => components[componentID],
  //       element,
  //       ['a', 'b', 'd'],
  //     );

  //     expect(found?.id).toEqual('d');
  //   });
});
