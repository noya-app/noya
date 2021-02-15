# Ayano

The hackable design tool.

## Why?

Building a design tool from scratch is challenging and time-consuming, which
greatly limits innovation. This project aims to be the foundation for custom
design tools.

## Packages

The project is broken up into many packages that can be included indepently.
Here's a quick summary of the key packages:

- [App](/packages/app) - The reference app of a design tool built with these
  packages
- [State](/packages/ayano-state) - Manages the internal state of the UI and
  `.sketch` file
- [Renderer](/packages/ayano-renderer) - Render a `.sketch` file to an HTML5
  canvas (via Google's
  [Skia compiled to webassembly](https://www.npmjs.com/package/canvaskit-wasm))
- [Sketch File](/packages/ayano-sketch-file) - Parse a `.sketch` file into JSON
- [Color Picker](/packages/ayano-colorpicker) - A React component for picking
  colors (based on [react-colorful](https://github.com/omgovich/react-colorful))

## Development Setup

To install, navigate to the root directory and run:

```
yarn
```

Then, to launch the reference app:

```
yarn start
```

This project is built with https://github.com/jpmorganchase/modular, which is an
abstraction layer on top of yarn workspaces.
