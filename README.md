<img width="1200" alt="Frame 1" src="https://user-images.githubusercontent.com/1198882/217942771-01367c66-6e4b-40f5-9427-caa42f53138a.png">

# Noya

The open design tools SDK.

- View our experimental wireframing tool at: https://www.noya.io
- View our Sketch-compatible demo design tool: https://www.noya.design

## Why?

Building a design tool today is like building a game without a game engine. It's too difficult and too much work for most developers to attempt. Generally, only specialized *design tools companies* can attempt it.

We want there to be more design & creative tools in the world. If you have an idea for a tool, you should be able to build it with Noya.

## Contributing

We're not trying to grow the open source community at this time, but if you'd like to collaborate, feel free to reach out on Discord: https://discord.gg/NPGAwyEBJw

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

## Running Tests

To run tests for all packages, run:

```
yarn test
```

To run tests for a specific package, e.g. `noya-utils`, run:

```
yarn test noya-utils
```
