# 2D Graphics

Operating systems, web browsers, and even image file formats all rely on 2D
graphics for presenting a user interface. Examples of 2D graphics engines
include:

- [Core Graphics](https://developer.apple.com/documentation/coregraphics) for
  macOS
- [Cairo](https://www.cairographics.org/) for most platforms
- [Skia](https://skia.org/) for most platforms
- HTML5 Canvas's (2D
  Context)[https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D]
- PDF and EPS file formats

These 2D graphics engines all expose fairly similar APIs.

## How graphics engines work

2D graphics engines let us draw paths, and then fill or stroke them with a
color, gradient, or image. A typical example of drawing a rectangle might look
like this:

```
setFillColor('red');
setStrokeColor('black');
setStrokeWidth(2);
drawRect(10, 10, 100, 100);
```

This hypothetical example would draw a 100x100 rectangle at the point (10,10),
with a red fill and a black stroke 2 units wide.

Drawing APIs are typically stateful, and rely on a global context object for
configuration. This global context object may hold the current color,
transformation matrix, and clipping mask that will be applied to any paths that
are drawn.

## The context stack

2D graphics are often drawn from a tree of different shapes and UI components.
These components may support grouping, and each group may support
transformations like scaling and rotation. 2D graphics engines store a _stack_
of contexts, to make it more convenient to render trees of components.

When we want to draw our component tree, we'll typically traverse each component
in the tree. When we visit a component, we'll set a variety of context
properties for that component, such as the rotation. When we visit descendants,
we most likely want to use the same rotation, and when we traverse back up to
the parent, we want to reset the rotation to whatever it was previously. We can
achieve this behavior by pushing a new context onto the stack anytime we enter a
component, and popping the context when we leave a component.

Often the method for pushing a context onto the stack is called "save": we're
saving the current context. To pop, we call "restore". Note that when we "save",
this _clones_ our current context and pushes it onto the stack - in other words,
we always build off the current context, we never reset to a "blank" context.

## Paths

A single path is composed of 0 or more path segments. Most APIs support the same
handful of path segment types: straight lines, elliptical arcs, quadratic Bézier
curves, and cubic Bézier curves. Some APIs may also support hyperbolic arcs.

> Sometimes we will approximate every kind of path segment using cubic curves
> for simplicity. If we can convert everything into a cubic curve, we only need
> to handle one kind of path segment when rendering.

Path segments do not need to be contiguous. We can add both a rectangle and a
circle to the same path that don't touch or intersect in any way, and it's still
a single path.

## Clipping masks

A clipping mask is a special path that can mask anything else we draw. A context
may hold a single clipping mask, but we can intersect/union clipping masks to
make more complex masks.

## Winding rule

The winding rule is a property that determines how paths are filled. It affects
paths that intersect themselves and thus contain holes.

## Hardware acceleration

For performance, all drawing is "hardware accelerated": drawing happens on the
GPU, rather than the CPU. When we create a path, the graphics engine will
tesselate that path into many tiny triangles that cover the same area (GPUs
typically only render triangles). The vertices of these triangles are then send
to the GPU. When we specify a fill color for our path, the graphics engine will
create a fragment shader and send it to the GPU. The GPU then fills the vertices
using the fragment shader.
