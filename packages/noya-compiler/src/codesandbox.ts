import { getParameters } from 'codesandbox/lib/api/define';

function getCodesandboxParameters({
  files,
}: {
  files: Record<string, string>;
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
