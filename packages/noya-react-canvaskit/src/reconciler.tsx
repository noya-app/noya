// Some snippets adapted from udevbe/react-canvaskit (MIT License)
// https://github.com/udevbe/react-canvaskit/blob/459c6d804e18b4e6603acc370c961c77244b552f/react-canvaskit/src/ReactCanvasKit.tsx

import { Canvas, CanvasKit, Surface } from 'canvaskit';
import type { ReactNode } from 'react';
import type { HostConfig } from 'react-reconciler';
import ReactReconciler from 'react-reconciler';
import {
  AnyElementInstance,
  AnyElementProps,
  ElementInstance,
  ElementType,
  ElementTypeMap,
} from './types';

declare module 'canvaskit' {
  interface Surface {
    flush(): void;
    _id: number;
  }
}

export type PublicInstance = AnyElementInstance;

type ChildSet = AnyElementInstance[];

function isContainerElement(
  element: AnyElementInstance,
): element is ElementInstance<'Group'> {
  return element.type === 'Group';
}

function createElementInstance<K extends keyof ElementTypeMap>(
  type: K,
  props: ElementTypeMap[K]['props'],
): ElementTypeMap[K] {
  const instance = { type, props } as unknown as ElementTypeMap[K];

  if (isContainerElement(instance)) {
    instance._elements = [];
  }

  return instance;
}

interface ReactCanvasKitContext {
  CanvasKit: CanvasKit;
  canvas: Canvas;
}

interface RootComponent {
  context: ReactCanvasKitContext;
  surface: Surface;
  children: ElementInstance<ElementType>[];
}

interface ReactCanvasKitHostConfig
  extends HostConfig<
    ElementType, // Type
    AnyElementProps, // Props
    RootComponent, // Container
    AnyElementInstance, // Instance
    ElementInstance<'Text'>, // TextInstance
    any, // SuspenseInstance
    any, // HydratableInstance
    PublicInstance, // PublicInstance
    ReactCanvasKitContext, // HostContext
    any, // UpdatePayload
    ChildSet, // _ChildSet
    any, // TimeoutHandle
    any // NoTimeout
  > {}

// https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md
const hostConfig: ReactCanvasKitHostConfig = {
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  // queueMicrotask:
  //   typeof queueMicrotask !== 'undefined' ? queueMicrotask : setTimeout,
  now: (typeof performance !== 'undefined' ? performance : Date).now,
  supportsMutation: false,
  supportsPersistence: true,
  supportsHydration: false,
  isPrimaryRenderer: false,

  preparePortalMount: () => {},

  createContainerChildSet(
    _container: RootComponent,
  ): ElementInstance<ElementType>[] {
    return [];
  },

  appendChildToContainerChildSet(
    childSet: ChildSet,
    child: ElementInstance<ElementType>,
  ) {
    childSet.push(child);
  },

  replaceContainerChildren(container: RootComponent, newChildren: ChildSet) {
    container.children = newChildren;
  },

  getRootHostContext(
    rootContainerInstance: RootComponent,
  ): ReactCanvasKitContext {
    return rootContainerInstance.context;
  },

  /**
   * This function provides a way to access context from the parent and also a way to pass some context to the immediate
   * children of the current node. Context is basically a regular object containing some information.
   *
   * @param parentHostContext Context from parent. Example: This will contain rootContext for the immediate child of
   * roothost.
   * @param type This contains the type of fiber i.e, ‘div’, ‘span’, ‘p’, ‘input’ etc.
   * @param rootContainerInstance rootInstance is basically the root dom node you specify while calling render. This is
   * most commonly <div id="root"></div>
   * @return A context object that you wish to pass to immediate child.
   */
  getChildHostContext(
    parentHostContext,
    type,
    rootContainerInstance,
  ): ReactCanvasKitContext {
    return parentHostContext;
  },

  /**
   * If the function returns true, the text would be created inside the host element and no new text element would be
   * created separately.
   *
   * If this returned true, the next call would be to createInstance for the current element and traversal would stop at
   * this node (children of this element wont be traversed).
   *
   * If it returns false, getChildHostContext and shouldSetTextContent will be called on the child elements and it will
   * continue till shouldSetTextContent returns true or if the recursion reaches the last tree endpoint which usually is
   * a text node. When it reaches the last leaf text node it will call createTextInstance
   *
   * @param type This contains the type of fiber i.e, ‘div’, ‘span’, ‘p’, ‘input’ etc.
   * @param props Contains the props passed to the host react element.
   * @return This should be a boolean value.
   */
  shouldSetTextContent(type, props): boolean {
    return type === 'Text';
  },

  /**
   * Here we specify how should renderer handle the text content
   *
   * @param text contains the text string that needs to be rendered.
   * @param rootContainerInstance root dom node you specify while calling render. This is most commonly
   * <div id="root"></div>
   * @param hostContext contains the context from the host node enclosing this text node. For example, in the case of
   * <p>Hello</p>: currentHostContext for Hello text node will be host context of p.
   * @param internalInstanceHandle The fiber node for the text instance. This manages work for this instance.
   * @return This should be an actual text view element. In case of dom it would be a textNode.
   */
  createTextInstance(
    text,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle,
  ): ElementInstance<'Text'> {
    throw new Error(`Using plain strings as elements isn't supported yet`);
  },

  /**
   * Create instance is called on all host nodes except the leaf text nodes. So we should return the correct view
   * element for each host type here. We are also supposed to take care of the props sent to the host element. For
   * example: setting up onClickListeners or setting up styling etc.
   *
   * @param type This contains the type of fiber i.e, ‘div’, ‘span’, ‘p’, ‘input’ etc.
   * @param props  Contains the props passed to the host react element.
   * @param rootContainerInstance Root dom node you specify while calling render. This is most commonly <div id="root"></div>
   * @param hostContext contains the context from the parent node enclosing this node. This is the return value from getChildHostContext of the parent node.
   * @param internalInstanceHandle The fiber node for the text instance. This manages work for this instance.
   */
  createInstance(
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle,
  ) {
    return createElementInstance(type, props);
  },

  /**
   * Here we will attach the child dom node to the parent on the initial render phase. This method will be called for
   * each child of the current node.
   *
   * @param parentInstance The current node in the traversal
   * @param child The child dom node of the current node.
   */
  appendInitialChild(parentInstance, child) {
    if (isContainerElement(parentInstance)) {
      parentInstance._elements.push(child);
      // console.log('parent', parentInstance, child);
      // parentInstance.children.push(child);
    } else {
      throw new Error(
        `Bug? Trying to append a child to a parent that is not a container. ${child.type}`,
      );
    }
  },

  /**
   * In case of react native renderer, this function does nothing but return false.
   *
   * In case of react-dom, this adds default dom properties such as event listeners, etc.
   * For implementing auto focus for certain input elements (autofocus can happen only
   * after render is done), react-dom sends return type as true. This results in commitMount
   * method for this element to be called. The commitMount will be called only if an element
   * returns true in finalizeInitialChildren and after the all elements of the tree has been
   * rendered (even after resetAfterCommit).
   *
   * @param parentInstance The instance is the dom element after appendInitialChild.
   * @param type This contains the type of fiber i.e, ‘div’, ‘span’, ‘p’, ‘input’ etc.
   * @param props Contains the props passed to the host react element.
   * @param rootContainerInstance root dom node you specify while calling render. This is most commonly <div id="root"></div>
   * @param hostContext contains the context from the parent node enclosing this node. This is the return value from getChildHostContext of the parent node.
   */
  finalizeInitialChildren(
    parentInstance,
    type,
    props,
    rootContainerInstance,
    hostContext,
  ) {
    return false;
  },

  finalizeContainerChildren(container: RootComponent, newChildren: ChildSet) {},

  /**
   * This function is called when we have made a in-memory render tree of all the views (Remember we are yet to attach
   * it the the actual root dom node). Here we can do any preparation that needs to be done on the rootContainer before
   * attaching the in memory render tree. For example: In the case of react-dom, it keeps track of all the currently
   * focused elements, disabled events temporarily, etc.
   *
   * @param containerInfo root dom node you specify while calling render. This is most commonly <div id="root"></div>
   */
  prepareForCommit(containerInfo: RootComponent) {
    return null;
  },

  /**
   * This function gets executed after the inmemory tree has been attached to the root dom element. Here we can do any
   * post attach operations that needs to be done. For example: react-dom re-enabled events which were temporarily
   * disabled in prepareForCommit and refocuses elements, etc.
   *
   * @param containerInfo root dom node you specify while calling render. This is most commonly <div id="root"></div>
   */
  resetAfterCommit(containerInfo) {
    try {
      const {
        context: { CanvasKit, canvas },
      } = containerInfo;

      const draw = (element: AnyElementInstance) => {
        switch (element.type) {
          case 'Rect': {
            const { rect, cornerRadius, paint } = element.props;

            if (cornerRadius) {
              const roundedRect = new Float32Array(12);
              roundedRect.set(rect);
              roundedRect.fill(cornerRadius, 4);
              canvas.drawRRect(roundedRect, paint);
            } else {
              canvas.drawRect(rect, paint);
            }

            break;
          }
          case 'Path': {
            const { path, paint } = element.props;
            canvas.drawPath(path, paint);
            break;
          }
          case 'Image': {
            const { rect, image, paint, resample } = element.props;

            const inputRect = CanvasKit.XYWHRect(
              0,
              0,
              image.width(),
              image.height(),
            );

            if (resample) {
              canvas.drawImageRectCubic(
                image,
                inputRect,
                rect,
                1 / 3,
                1 / 3,
                paint,
              );
            } else {
              canvas.drawImageRect(image, inputRect, rect, paint);
            }

            break;
          }
          case 'Text':
            const { rect, paragraph } = element.props;

            canvas.drawParagraph(paragraph, rect[0], rect[1]);

            break;
          case 'Group': {
            const {
              transform,
              opacity,
              clip,
              colorFilter,
              imageFilter,
              backdropImageFilter,
            } = element.props;

            const saveCount = canvas.getSaveCount();

            canvas.save();

            if (clip) {
              if (clip.path instanceof Float32Array) {
                canvas.clipRect(clip.path, clip.op, clip.antiAlias ?? true);
              } else {
                canvas.clipPath(clip.path, clip.op, clip.antiAlias ?? true);
              }
            }

            if (transform) {
              canvas.concat(transform);
            }

            // If we need to apply effects to the group as a whole, we need
            // to draw the elements on a separate bitmap using `saveLayer`
            const needsLayer =
              opacity < 1 || colorFilter || imageFilter || backdropImageFilter;

            if (needsLayer) {
              console.log('reconciler');
              const layerPaint = new CanvasKit.Paint();

              if (opacity < 1) {
                layerPaint.setAlphaf(opacity);
              }

              if (colorFilter) {
                layerPaint.setColorFilter(colorFilter);
              }

              if (imageFilter) {
                layerPaint.setImageFilter(imageFilter);
              }

              canvas.saveLayer(layerPaint, null, backdropImageFilter);
            }

            element._elements.forEach(draw);

            canvas.restoreToCount(saveCount);
            break;
          }
          // default:
          //   throw new Error(`Draw not handled for '${element.type}'`);
        }
      };

      containerInfo.children.forEach(draw);

      if (!containerInfo.surface.isDeleted()) {
        containerInfo.surface.flush();
      }
    } catch (e) {
      console.warn('noya-react-canvaskit error!', e);
    }
  },

  getPublicInstance(instance: AnyElementInstance): PublicInstance {
    return instance;
  },

  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    hostContext,
  ) {},

  cloneInstance(
    instance: AnyElementInstance,
    updatePayload: any,
    type: ElementType,
    oldProps: AnyElementProps,
    newProps: AnyElementProps,
    internalInstanceHandle: unknown,
    keepChildren: boolean,
    recyclableInstance: AnyElementInstance,
  ): AnyElementInstance {
    const element = createElementInstance(type, newProps);

    if (
      keepChildren &&
      isContainerElement(element) &&
      isContainerElement(instance)
    ) {
      element._elements = instance._elements;
    }

    return element;
  },
};

const canvasKitReconciler = ReactReconciler(hostConfig);

canvasKitReconciler.injectIntoDevTools({
  bundleType: 1, // 0 for PROD, 1 for DEV
  version: '0.0.1', // version for your renderer
  rendererPackageName: 'noya-react-canvaskit', // package name
});

type ExtendedSurface = Surface & { _container: any };

function getContainerForSurface(
  surface: Surface,
  context: ReactCanvasKitContext,
) {
  let extendedSurface = surface as ExtendedSurface;

  if (!extendedSurface._container) {
    const root: RootComponent = { surface, context, children: [] };
    const container = canvasKitReconciler.createContainer(root, 2, false, null);

    extendedSurface._container = container;
  }

  return extendedSurface._container;
}

export function render(
  element: ReactNode,
  surface: Surface,
  CanvasKit: CanvasKit,
  callback?: () => void,
) {
  const context = {
    CanvasKit,
    canvas: surface.getCanvas(),
  };

  const container = getContainerForSurface(surface, context);

  canvasKitReconciler.updateContainer(element, container, null, () => {
    callback?.();
  });
}

export function unmount(surface: Surface, callback?: () => void) {
  const container = (surface as ExtendedSurface)._container;

  canvasKitReconciler.updateContainer(null, container, null, () => {
    callback?.();
  });
}
