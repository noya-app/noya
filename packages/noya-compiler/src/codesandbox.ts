import { getParameters } from 'codesandbox/lib/api/define';

function getCodesandboxParameters({
  files,
  main,
}: {
  files: Record<string, string>;
  main: string;
}) {
  return getParameters({
    files: {
      ...Object.fromEntries(
        Object.entries(files).map(([name, code]) => [
          name,
          { isBinary: false, content: code },
        ]),
      ),
    },
  });
}

export function openInCodesandbox(
  parameters: Parameters<typeof getCodesandboxParameters>[0],
) {
  const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${getCodesandboxParameters(
    parameters,
  )}`;

  window.open(url, '_blank');
}

// 'package.json': {
//   isBinary: false,
//   content: {
//     name: 'App',
//     version: '1.0.0',
//     main,
//     scripts: {
//       start: `parcel ${main} --open`,
//       build: `parcel build ${main}`,
//     },
//     dependencies: {},
//     devDependencies: {
//       'parcel-bundler': '*',
//     },
//   } as any,
// },
